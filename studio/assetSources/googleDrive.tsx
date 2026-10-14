/* "Google Drive link" in the Select menu of every image and file field.

   The editor pastes the share link of a public Drive file; the studio
   downloads it in the browser through the Drive API (the plain download links
   don't allow cross-site requests, the API does) and hands it to Sanity's own
   uploader, so the result is an ordinary Sanity asset on the CDN. Drive is
   only touched during the import.

   Needs SANITY_STUDIO_GOOGLE_API_KEY (see .env.example). */
import { Box, Button, Card, Dialog, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { HardDriveDownload } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AssetFromSource, AssetSource, AssetSourceComponentProps, ImageAsset } from "sanity";

const API_KEY = process.env.SANITY_STUDIO_GOOGLE_API_KEY ?? "";
const API = "https://www.googleapis.com/drive/v3/files";

/* Accepts the link shapes Drive hands out: /file/d/<id>/view, open?id=<id>,
   uc?id=<id>, and a bare ID. */
function parseFileId(link: string): string | null {
  const text = link.trim();
  if (/^[\w-]{20,}$/.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (!/(^|\.)google\.com$/.test(url.hostname)) return null;
  return url.pathname.match(/\/d\/([\w-]{20,})/)?.[1] ?? url.searchParams.get("id");
}

/* Same rules as the <input accept> attribute: "image/*", "video/mp4,…", "". */
function isAccepted(mimeType: string, accept: string) {
  const rules = accept.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  return (
    rules.length === 0 ||
    rules.some((r) => (r.endsWith("/*") ? mimeType.startsWith(r.slice(0, -1)) : mimeType === r))
  );
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const NOT_SHARED =
  "Drive didn't let us read that file. In Drive, open Share → General access and choose \"Anyone with the link\", then try again.";

async function driveError(res: Response) {
  if (res.status === 404 || res.status === 401) return NOT_SHARED;
  const body = await res.json().catch(() => null);
  const message: string = body?.error?.message ?? res.statusText;
  if (/api key|API_KEY|has not been used|disabled/i.test(message)) {
    return `The Google API key isn't working (${message}). Ask Jed to check it.`;
  }
  return res.status === 403 ? `${NOT_SHARED} (${message})` : `Drive error ${res.status}: ${message}`;
}

type Meta = { name: string; mimeType: string; size?: string };

function GoogleDriveDialog({ accept, assetType, onClose, onSelect }: AssetSourceComponentProps) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ name: string; loaded: number; total: number } | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  async function importFile(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (/\/folders\//.test(link)) {
      setError("That's a folder link. Open the file inside it and copy the file's link instead.");
      return;
    }
    const id = parseFileId(link);
    if (!id) {
      setError("That doesn't look like a Google Drive file link.");
      return;
    }

    const controller = new AbortController();
    abort.current = controller;
    const query = `supportsAllDrives=true&key=${encodeURIComponent(API_KEY)}`;

    try {
      const metaRes = await fetch(`${API}/${id}?fields=name,mimeType,size&${query}`, { signal: controller.signal });
      if (!metaRes.ok) throw new Error(await driveError(metaRes));
      const meta: Meta = await metaRes.json();

      if (meta.mimeType.startsWith("application/vnd.google-apps")) {
        throw new Error("That's a Google Docs/Sheets/Slides file, not a photo or video.");
      }
      if (!isAccepted(meta.mimeType, accept)) {
        throw new Error(`"${meta.name}" is a ${meta.mimeType} file, which this field doesn't take.`);
      }

      const total = Number(meta.size ?? 0);
      setProgress({ name: meta.name, loaded: 0, total });

      const fileRes = await fetch(`${API}/${id}?alt=media&${query}`, { signal: controller.signal });
      if (!fileRes.ok || !fileRes.body) throw new Error(await driveError(fileRes));

      /* Read it in chunks rather than res.blob() so big videos show progress. */
      const reader = fileRes.body.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        setProgress({ name: meta.name, loaded, total });
      }

      const file = new File(chunks, meta.name, { type: meta.mimeType });
      onSelect([
        {
          kind: "file",
          /* Typed as Sanity's schema `File`, but the uploader wants a DOM File. */
          value: file as unknown as AssetFromSource["value"],
          assetDocumentProps: {
            originalFilename: meta.name,
            source: { name: "google-drive", id, url: `https://drive.google.com/file/d/${id}/view` },
          } as ImageAsset,
        },
      ]);
    } catch (err) {
      if (controller.signal.aborted) return;
      setProgress(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const busy = progress !== null;
  const percent = progress?.total ? Math.round((progress.loaded / progress.total) * 100) : null;

  return (
    <Dialog
      id="google-drive-import"
      header={`Import ${assetType === "image" ? "an image" : "a file"} from Google Drive`}
      onClose={onClose}
      width={1}
    >
      <Box padding={4}>
        {!API_KEY ? (
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>
              Importing from Drive isn't set up yet: the studio needs a Google API key. Ask Jed to add
              SANITY_STUDIO_GOOGLE_API_KEY and redeploy.
            </Text>
          </Card>
        ) : (
          <form onSubmit={importFile}>
            <Stack gap={4}>
              <Stack gap={3}>
                <Text size={1} weight="medium">
                  Drive link
                </Text>
                <TextInput
                  value={link}
                  onChange={(e) => setLink(e.currentTarget.value)}
                  placeholder="https://drive.google.com/file/d/…/view"
                  disabled={busy}
                  autoFocus
                />
                <Text size={1} muted>
                  In Drive: right-click the file → Share → set General access to &quot;Anyone with the link&quot;
                  → Copy link.
                </Text>
              </Stack>

              {error && (
                <Card padding={3} radius={2} tone="critical">
                  <Text size={1}>{error}</Text>
                </Card>
              )}

              {progress && (
                <Text size={1} muted>
                  Downloading {progress.name}… {formatSize(progress.loaded)}
                  {progress.total ? ` of ${formatSize(progress.total)} (${percent}%)` : ""}
                </Text>
              )}

              <Flex gap={2} justify="flex-end">
                <Button mode="ghost" text="Cancel" onClick={onClose} />
                <Button
                  type="submit"
                  tone="primary"
                  text={busy ? "Importing…" : "Import"}
                  disabled={busy || !link.trim()}
                  loading={busy}
                />
              </Flex>
            </Stack>
          </form>
        )}
      </Box>
    </Dialog>
  );
}

export const googleDriveSource: AssetSource = {
  name: "google-drive",
  title: "Google Drive link",
  icon: HardDriveDownload,
  component: GoogleDriveDialog,
};
