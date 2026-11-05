/* Compression for a file field's own Upload button and drag and drop, plus the
   controls every upload route shares.

   withCompression wraps Sanity's default uploader, which those two use: videos
   are compressed first (lib/compress.ts), then handed to it as usual.
   CompressionInput adds the settings under any field that takes videos, and
   shows the outcome as a toast. CompressionLayout puts the "too long" popup on
   every page, because the uploader has no screen of its own.

   Uploader is a beta Sanity API, so check this still works after upgrading
   Sanity. */
import { Box, Button, Checkbox, Dialog, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { useEffect, useState } from "react";
import {
  isFileSchemaType,
  set,
  type AssetSource,
  type AssetSourceUploader,
  type InputProps,
  type LayoutProps,
} from "sanity";
import {
  COMPRESSION_LABEL,
  CompressionCancelled,
  SIZE_LIMIT,
  formatDuration,
  formatMb,
  isCompressionEnabled,
  prepareVideo,
  setCompressionEnabled,
  setCutSetting,
  useCompressionEnabled,
  useCutRequest,
  useCutSetting,
  type CutRequest,
} from "../lib/compress";

type UploadOptions = Parameters<AssetSourceUploader["upload"]>[1];
type UploadEvent = Parameters<Parameters<AssetSourceUploader["subscribe"]>[0]>[0];
type Notice = { status: "success" | "warning" | "error"; title: string };

/* The uploader has no UI of its own, so it tells the field through this. */
const noticeListeners = new Set<(notice: Notice) => void>();
const notify = (notice: Notice) => noticeListeners.forEach((fn) => fn(notice));

const isVideo = (file: File) => file.type.startsWith("video/");

export function withCompression(source: AssetSource): AssetSource {
  const Base = source.Uploader;
  if (source.name !== "sanity-default" || !Base) return source;

  class CompressingUploader extends Base {
    listeners = new Set<(event: UploadEvent) => void>();
    controller: AbortController | null = null;

    subscribe(subscriber: (event: UploadEvent) => void) {
      this.listeners.add(subscriber);
      const unsubscribe = super.subscribe(subscriber);
      return () => {
        this.listeners.delete(subscriber);
        unsubscribe();
      };
    }

    upload(files: File[], options: UploadOptions) {
      if (!isCompressionEnabled() || !files.some(isVideo)) return super.upload(files, options);
      void this.compressThenUpload(files, options);
      return [];
    }

    abort(file?: Parameters<AssetSourceUploader["abort"]>[0]) {
      this.controller?.abort();
      super.abort(file);
    }

    async compressThenUpload(files: File[], options: UploadOptions) {
      const controller = new AbortController();
      this.controller = controller;
      try {
        const ready: File[] = [];
        for (const file of files) {
          if (isVideo(file)) showCompressing(file, options);
          /* The studio calls an upload stale after 2 minutes without news, which
             the popup can easily take while it waits for an answer. */
          const keepFresh = setInterval(
            () => options?.onChange?.([set(new Date().toISOString(), ["_upload", "updatedAt"])]),
            30_000,
          );
          let reported = 0;
          const { file: prepared, note, warning } = await prepareVideo(file, {
            signal: controller.signal,
            ask: true,
            onProgress: (fraction) => {
              if (Date.now() - reported < 1000) return;
              reported = Date.now();
              options?.onChange?.([
                set(Math.max(2, Math.round(fraction * 100)), ["_upload", "progress"]),
                set(new Date().toISOString(), ["_upload", "updatedAt"]),
              ]);
            },
          }).finally(() => clearInterval(keepFresh));
          if (warning) notify({ status: "warning", title: warning });
          else if (note) notify({ status: "success", title: `${file.name}: ${note}` });
          options?.onChange?.([set({ name: prepared.name, type: prepared.type }, ["_upload", "file"])]);
          ready.push(prepared);
        }
        controller.signal.throwIfAborted();
        super.upload(ready, options);
      } catch (err) {
        /* No file has reached the real uploader yet, so it won't tell the studio
           this upload is over: without these events the field stays stuck on
           the progress bar. */
        const failed = files.map((file) => ({
          id: file.name,
          file,
          progress: 0,
          status: "error" as const,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
        const stopped = controller.signal.aborted || err instanceof CompressionCancelled;
        if (!stopped) {
          notify({ status: "error", title: failed[0].error.message });
          this.listeners.forEach((fn) => fn({ type: "error", files: failed }));
        }
        this.listeners.forEach((fn) => fn({ type: "all-complete", files: stopped ? [] : failed }));
      }
    }
  }

  return { ...source, Uploader: CompressingUploader };
}

function showCompressing(file: File, options: UploadOptions) {
  options?.onChange?.([set({ name: `${file.name} (compressing…)`, type: file.type }, ["_upload", "file"])]);
}

/* A whole number of seconds, 1 or more. Lets the box be empty while typing, and
   goes back to the last good value if it's left that way. */
function SecondsInput({ value, onChange, disabled }: { value: number; onChange: (seconds: number) => void; disabled?: boolean }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Box style={{ width: 72 }}>
      <TextInput
        type="number"
        min={1}
        step={1}
        fontSize={1}
        padding={2}
        aria-label="Seconds"
        disabled={disabled}
        value={draft ?? String(value)}
        onChange={(e) => {
          const text = e.currentTarget.value;
          setDraft(text);
          const seconds = Math.floor(Number(text));
          if (seconds >= 1) onChange(seconds);
        }}
        onBlur={() => setDraft(null)}
      />
    </Box>
  );
}

/* The compression switch and, under it, the option to cut every video. */
export function CompressionSettings({ disabled }: { disabled?: boolean }) {
  const on = useCompressionEnabled();
  const cut = useCutSetting();
  return (
    <Stack gap={2}>
      <Flex as="label" align="center" gap={2}>
        <Checkbox checked={on} onChange={(e) => setCompressionEnabled(e.currentTarget.checked)} disabled={disabled} />
        <Text size={1}>{COMPRESSION_LABEL}</Text>
      </Flex>
      {on && (
        <Flex align="center" gap={2}>
          <Flex as="label" align="center" gap={2}>
            <Checkbox
              checked={cut.on}
              onChange={(e) => setCutSetting({ on: e.currentTarget.checked })}
              disabled={disabled}
            />
            <Text size={1}>Keep only the first</Text>
          </Flex>
          <SecondsInput value={cut.seconds} onChange={(seconds) => setCutSetting({ seconds })} disabled={disabled} />
          <Text size={1}>seconds</Text>
        </Flex>
      )}
    </Stack>
  );
}

function CutDialog({ request }: { request: CutRequest }) {
  const [seconds, setSeconds] = useState(request.defaultSeconds);
  const whole = request.estimate(request.duration);
  const chosen = request.estimate(Math.min(seconds, request.duration));
  const limit = formatMb(SIZE_LIMIT).replace(".0", "");
  return (
    /* Above the Google Drive dialog, which can be what started this upload. */
    <Dialog
      id={`video-cut-${request.id}`}
      header="This video is too long"
      width={1}
      zOffset={100000}
      onClose={() => request.answer("cancel")}
    >
      <Box padding={4}>
        <Stack gap={4}>
          <Text size={1}>
            {request.name} is {formatDuration(request.duration)} long. Even at the lowest quality it would be about{" "}
            {formatMb(whole.bytes)}, over the {limit} limit for loop clips.
          </Text>
          <Flex align="center" gap={2}>
            <Text size={1}>Keep the first</Text>
            <SecondsInput value={seconds} onChange={setSeconds} />
            <Text size={1}>seconds</Text>
          </Flex>
          <Text size={1} muted>
            {seconds < request.duration
              ? `About ${formatMb(chosen.bytes)}${chosen.lowered ? ", at lower quality to fit the limit" : ""}.`
              : `That's the whole video, which is only ${formatDuration(request.duration)} long.`}
          </Text>
          <Flex gap={2} justify="flex-end" wrap="wrap">
            <Button mode="bleed" text="Cancel upload" onClick={() => request.answer("cancel")} />
            <Button mode="ghost" text="Keep all of it" onClick={() => request.answer("keep")} />
            <Button
              tone="primary"
              text={`Keep ${seconds} seconds`}
              disabled={seconds >= request.duration}
              onClick={() => request.answer(seconds)}
            />
          </Flex>
        </Stack>
      </Box>
    </Dialog>
  );
}

/* For studio.components.layout. */
export function CompressionLayout(props: LayoutProps) {
  const request = useCutRequest();
  return (
    <>
      {props.renderDefault(props)}
      {request && <CutDialog key={request.id} request={request} />}
    </>
  );
}

function VideoFieldInput(props: InputProps) {
  const { push } = useToast();

  useEffect(() => {
    const show = (notice: Notice) => push({ id: "video-compression", closable: true, ...notice });
    noticeListeners.add(show);
    return () => {
      noticeListeners.delete(show);
    };
  }, [push]);

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      {!props.readOnly && <CompressionSettings />}
    </Stack>
  );
}

/* For form.components.input: only touches file fields that take videos. */
export function CompressionInput(props: InputProps) {
  const { schemaType } = props;
  return isFileSchemaType(schemaType) && /video\//.test(schemaType.options?.accept ?? "") ? (
    <VideoFieldInput {...props} />
  ) : (
    props.renderDefault(props)
  );
}
