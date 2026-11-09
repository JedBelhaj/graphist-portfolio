/* "Bulk add" tab in the studio: turns a whole folder of photos, videos or client
   message screenshots into items in one go, instead of creating them one at a
   time.

   Files come from this computer (pick files, pick a folder, or drop them in)
   or from a shared Google Drive folder (lib/drive.ts). Each one is uploaded
   and becomes its own document, added to the end of that list, where it can
   then be reordered, hidden or edited like any other.

   Videos are compressed on this computer first, unless that's switched off, and
   can be cut to their first seconds (lib/compress.ts). A single video that's too
   long gets a popup asking; in a batch the list just says so. They need a poster
   frame for the site to show them, so one
   is grabbed from the clip in the browser, and the Landscape/Vertical format is
   read from its shape. Uploads run a few at a time (compressed videos one at a
   time); a failed file doesn't stop the rest.

   Photos and videos can also go straight into a category of the Photography /
   Videography page: pick one (or type a new one) for the whole batch, and once
   the uploads finish, everything that was added is put in it, in the order it
   was queued. */
import { Box, Button, Card, Checkbox, Container, Flex, Grid, Heading, Select, Stack, Text, TextInput } from "@sanity/ui";
import { LexoRank } from "lexorank";
import { FolderUp } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { useClient, type Tool } from "sanity";
import { CompressionSettings } from "../assetSources/compressedUpload";
import { SIZE_LIMIT, prepareVideo, useCompressionEnabled } from "../lib/compress";
import {
  API_KEY,
  downloadFile,
  formatSize,
  isAccepted,
  isFolder,
  listFolder,
  parseDriveLink,
  thumbUrl,
  type DriveItem,
} from "../lib/drive";

type Target = "photo" | "video" | "result";

const TARGETS: { type: Target; title: string; plural: string; singular: string }[] = [
  { type: "photo", title: "Photos", plural: "photos", singular: "photo" },
  { type: "video", title: "Videos", plural: "videos", singular: "video" },
  { type: "result", title: "Client messages", plural: "messages", singular: "message" },
];

const ACCEPT: Record<Target, string> = {
  photo: "image/*",
  video: "video/mp4,video/webm,video/quicktime",
  result: "image/*",
};

const PARALLEL = 3;

/* Where each kind of item is grouped into categories: the page document (a
   singleton, with a published copy and maybe a draft), and the array inside
   each category that holds the references. */
const CATEGORY_PAGES: Partial<Record<Target, { pageType: string; pageId: string; field: string }>> = {
  photo: { pageType: "photographyPage", pageId: "photographyPage", field: "photos" },
  video: { pageType: "videographyPage", pageId: "videographyPage", field: "videos" },
};

const NEW_CATEGORY = "__new__";

type Category = { _key: string; title: string };
type PageSections = { _id: string; sections?: Category[] | null };

const newKey = () => Math.random().toString(36).slice(2, 12);

type Job = {
  key: string;
  name: string;
  size: number;
  /* A local file, or a Drive item that is downloaded when its turn comes. */
  source: { file: File } | { drive: DriveItem };
  status: "waiting" | "working" | "done" | "failed";
  note?: string;
  /* Added, but the note says something needs a look. */
  warned?: boolean;
};

/* "my_shoot-04.final.MOV" → "My shoot 04 final". */
const titleFrom = (name: string) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

/* A still from the clip (a second in, or a third of the way for short ones),
   and whether it's vertical. Fails for formats the browser can't decode. */
function posterFrom(file: File): Promise<{ poster: Blob; vertical: boolean }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (fn: () => void) => {
      URL.revokeObjectURL(url);
      fn();
    };
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () => done(() => reject(new Error("the browser can't read this video format, so no poster frame")));
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 3) / 3);
    };
    video.onseeked = () => {
      const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) =>
          done(() =>
            blob
              ? resolve({ poster: blob, vertical: video.videoHeight > video.videoWidth })
              : reject(new Error("couldn't grab a poster frame")),
          ),
        "image/jpeg",
        0.86,
      );
    };
    video.src = url;
  });
}

function BulkAdd() {
  const client = useClient({ apiVersion: "2026-10-13" });
  const [target, setTarget] = useState<Target>("photo");
  const [keepHidden, setKeepHidden] = useState(false);
  const compressing = useCompressionEnabled();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [driveLink, setDriveLink] = useState("");
  const [driveItems, setDriveItems] = useState<DriveItem[] | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [driveLoading, setDriveLoading] = useState(false);

  const filesInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  /* "" = no category, NEW_CATEGORY = the name typed below, else a category's _key. */
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryChoice, setCategoryChoice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryReport, setCategoryReport] = useState<{ ok: boolean; text: string } | null>(null);
  const categoryPage = CATEGORY_PAGES[target];

  /* The page's categories, from its draft if it has one, plus any only the
     published copy has. */
  async function loadCategories(): Promise<Category[]> {
    if (!categoryPage) return [];
    const docs = await client.fetch<PageSections[]>(
      `*[_id in [$id, "drafts." + $id]]{ _id, "sections": sections[]{ _key, title } }`,
      { id: categoryPage.pageId },
    );
    const ordered = [...docs].sort((a) => (a._id.startsWith("drafts.") ? -1 : 1));
    const seen = new Set<string>();
    return ordered
      .flatMap((d) => d.sections ?? [])
      .filter((s) => s.title && !seen.has(s._key) && seen.add(s._key));
  }

  useEffect(() => {
    let live = true;
    setCategories([]);
    setCategoryChoice("");
    setNewCategory("");
    loadCategories()
      .then((list) => live && setCategories(list))
      .catch(() => {
        /* The picker just offers "No category" and "New category". */
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  /* Puts the new items at the end of a category, in both the published page
     and its draft (if there is one), so they show on the site right away and
     publishing the draft later doesn't take them out. A category that doesn't
     exist yet is created, with the same key in both. */
  async function addToCategory(ids: string[], category: { key: string; title: string }) {
    if (!categoryPage || !ids.length) return;
    const { pageType, pageId, field } = categoryPage;
    const refs = ids.map((id) => ({ _key: newKey(), _type: "reference" as const, _ref: id, _weak: true }));
    const docs = await client.fetch<PageSections[]>(`*[_id in [$id, "drafts." + $id]]{ _id, "sections": sections[]{ _key } }`, {
      id: pageId,
    });
    if (docs.length === 0) {
      await client.createIfNotExists({ _id: pageId, _type: pageType });
      docs.push({ _id: pageId, sections: [] });
    }
    const tx = client.transaction();
    for (const doc of docs) {
      const exists = (doc.sections ?? []).some((s) => s._key === category.key);
      const section = `sections[_key=="${category.key}"]`;
      if (exists) {
        tx.patch(doc._id, (p) => p.setIfMissing({ [`${section}.${field}`]: [] }).insert("after", `${section}.${field}[-1]`, refs));
      } else {
        tx.patch(doc._id, (p) =>
          p
            .setIfMissing({ sections: [] })
            .append("sections", [{ _key: category.key, _type: "categorySection", title: category.title, [field]: refs }]),
        );
      }
    }
    await tx.commit();
  }

  const update =(key: string, patch: Partial<Job>) =>
    setJobs((all) => all.map((j) => (j.key === key ? { ...j, ...patch } : j)));

  function queueFiles(list: FileList | File[]) {
    const accepted = Array.from(list).filter((f) => isAccepted(f.type, ACCEPT[target]));
    setJobs((all) => [
      ...all.filter((j) => j.status !== "done"),
      ...accepted.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        source: { file },
        status: "waiting" as const,
      })),
    ]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    queueFiles(e.dataTransfer.files);
  }

  async function openDrive(event: FormEvent) {
    event.preventDefault();
    const parsed = parseDriveLink(driveLink);
    if (!parsed?.folder) {
      setDriveError("Paste the link of a Drive folder (it contains /folders/).");
      return;
    }
    setDriveError(null);
    setDriveLoading(true);
    try {
      const items = await listFolder(parsed.id);
      const usable = items.filter((i) => !isFolder(i) && isAccepted(i.mimeType, ACCEPT[target]));
      setDriveItems(usable);
      setPicked(new Set(usable.map((i) => i.id)));
    } catch (err) {
      setDriveError(err instanceof Error ? err.message : String(err));
    } finally {
      setDriveLoading(false);
    }
  }

  function queueDrive() {
    const chosen = (driveItems ?? []).filter((i) => picked.has(i.id));
    setJobs((all) => [
      ...all.filter((j) => j.status !== "done"),
      ...chosen.map((item) => ({
        key: `drive-${item.id}`,
        name: item.name,
        size: Number(item.size ?? 0),
        source: { drive: item },
        status: "waiting" as const,
      })),
    ]);
    setDriveItems(null);
  }

  /* Returns the _id of the document it created. */
  async function addOne(job: Job, orderRank: string, ask: boolean): Promise<string> {
    update(job.key, { status: "working", note: undefined });
    const file =
      "file" in job.source
        ? job.source.file
        : await downloadFile(job.source.drive, (loaded, total) =>
            update(job.key, { note: `downloading ${formatSize(loaded)}${total ? ` of ${formatSize(total)}` : ""}` }),
          );
    const source =
      "drive" in job.source
        ? { name: "google-drive", id: job.source.drive.id, url: `https://drive.google.com/file/d/${job.source.drive.id}/view` }
        : undefined;

    if (target !== "video") {
      update(job.key, { note: "uploading" });
      const asset = await client.assets.upload("image", file, { filename: job.name, source });
      const created = await client.create({
        _type: target,
        orderRank,
        ...(keepHidden ? { hidden: true } : {}),
        image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      });
      update(job.key, { status: "done", note: undefined });
      return created._id;
    }

    const prepared = await prepareVideo(file, {
      ask,
      onProgress: (fraction) => update(job.key, { note: `compressing ${Math.round(fraction * 100)}%` }),
    });
    update(job.key, { note: "grabbing a poster frame" });
    const frame = await posterFrom(prepared.file).catch((err: Error) => err);
    update(job.key, { note: "uploading" });
    const clip = await client.assets.upload("file", prepared.file, { filename: prepared.file.name, source });
    const poster =
      frame instanceof Error
        ? null
        : await client.assets.upload("image", frame.poster, { filename: `${titleFrom(job.name)} poster.jpg` });
    const created = await client.create({
      _type: "video",
      orderRank,
      title: titleFrom(job.name),
      format: frame instanceof Error ? "landscape" : frame.vertical ? "vertical" : "landscape",
      ...(keepHidden ? { hidden: true } : {}),
      clip: { _type: "file", asset: { _type: "reference", _ref: clip._id } },
      ...(poster ? { poster: { _type: "image", asset: { _type: "reference", _ref: poster._id } } } : {}),
    });
    const large = !prepared.warning && prepared.file.size > SIZE_LIMIT;
    const notes = [
      prepared.warning ?? prepared.note,
      frame instanceof Error && `added without a poster (${frame.message}): set one by hand`,
      large && "large file: loop clips play best under 15 MB",
    ]
      .filter((note): note is string => Boolean(note))
      .map((note) => note.replace(/\.$/, ""));
    update(job.key, {
      status: "done",
      note: notes.join("; ") || undefined,
      warned: Boolean(prepared.warning) || frame instanceof Error || large,
    });
    return created._id;
  }

  async function run() {
    const todo = jobs.filter((j) => j.status === "waiting" || j.status === "failed");
    if (!todo.length) return;
    setRunning(true);
    setCategoryReport(null);

    /* The category for this batch: an existing one, or a new one (unless a
       category with that name is already there). */
    const typed = newCategory.trim();
    const chosen = categoryPage
      ? categoryChoice === NEW_CATEGORY
        ? (() => {
            const same = categories.find((c) => c.title.trim().toLowerCase() === typed.toLowerCase());
            return { key: same?._key ?? newKey(), title: same?.title ?? typed };
          })()
        : categories.find((c) => c._key === categoryChoice)
          ? { key: categoryChoice, title: categories.find((c) => c._key === categoryChoice)!.title }
          : null
      : null;

    /* Ranks after the current last item, so the new ones land at the end of
       the list in the order they were queued. */
    const last = await client.fetch<string | null>(`*[_type == $type] | order(orderRank desc)[0].orderRank`, {
      type: target,
    });
    let rank = last ? LexoRank.parse(last) : LexoRank.min();
    const ranks = todo.map(() => (rank = rank.genNext().genNext()).toString());

    /* Ids of what was added, by queue position, so the category keeps the order. */
    const created: (string | undefined)[] = [];
    let next = 0;
    const worker = async () => {
      while (next < todo.length) {
        const i = next++;
        try {
          created[i] = await addOne(todo[i], ranks[i], todo.length === 1);
        } catch (err) {
          update(todo[i].key, { status: "failed", note: err instanceof Error ? err.message : String(err) });
        }
      }
    };
    /* Compressing is heavy on memory and the video encoder: one at a time. */
    const parallel = target === "video" && compressing ? 1 : PARALLEL;
    await Promise.all(Array.from({ length: Math.min(parallel, todo.length) }, worker));

    const ids = created.filter((id): id is string => Boolean(id));
    if (chosen && ids.length) {
      try {
        await addToCategory(ids, chosen);
        setCategoryReport({
          ok: true,
          text: `${ids.length} added to the category “${chosen.title}”.`,
        });
        const list = await loadCategories().catch(() => null);
        if (list) {
          setCategories(list);
          /* A new category now exists: keep the batch pointed at it. */
          setCategoryChoice(chosen.key);
          setNewCategory("");
        }
      } catch (err) {
        setCategoryReport({
          ok: false,
          text: `The files were added, but couldn’t be put in the category “${chosen.title}” (${
            err instanceof Error ? err.message : String(err)
          }). Add them to it by hand in the ${singular === "photo" ? "Photography" : "Videography"} page.`,
        });
      }
    }
    setRunning(false);
  }

  const waiting = jobs.filter((j) => j.status === "waiting" || j.status === "failed").length;
  const done = jobs.filter((j) => j.status === "done").length;
  const { plural, singular } = TARGETS.find((t) => t.type === target)!;

  return (
    <Container width={2} padding={4} paddingY={5}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Heading size={3}>Bulk add</Heading>
          <Text muted size={1}>
            Add a whole folder at once. Each file becomes its own item at the end of its list, where you can reorder,
            hide or edit it as usual.
          </Text>
        </Stack>

        <Card padding={4} radius={3} border>
          <Stack gap={4}>
            <Flex gap={2}>
              {TARGETS.map((t) => (
                <Button
                  key={t.type}
                  text={t.title}
                  mode={target === t.type ? "default" : "ghost"}
                  tone={target === t.type ? "primary" : "default"}
                  disabled={running || jobs.some((j) => j.status !== "done")}
                  onClick={() => {
                    setTarget(t.type);
                    setDriveItems(null);
                  }}
                />
              ))}
            </Flex>
            {target === "result" && (
              <Text size={1} muted>
                They start with no caption, so keep them hidden until you&apos;ve added captions and alt text in Client
                messages.
              </Text>
            )}
            {target === "video" && (
              <>
                <Text size={1} muted>
                  Each video gets a poster frame grabbed from the clip, and its format (landscape or vertical) is set from
                  its shape. Titles come from the file names; change them afterwards.
                </Text>
                <Stack gap={2}>
                  <CompressionSettings disabled={running} />
                  {compressing && (
                    <Text size={1} muted>
                      Shrinks each video to at most 1080p and, where it can, under 15 MB, on this computer, one at a
                      time. Keep this tab open until they&apos;re done. Your original files aren&apos;t changed.
                    </Text>
                  )}
                </Stack>
              </>
            )}
            {categoryPage && (
              <Stack gap={3}>
                <Text size={1} weight="medium">
                  Category for this whole batch
                </Text>
                <Select
                  value={categoryChoice}
                  onChange={(e) => setCategoryChoice(e.currentTarget.value)}
                  disabled={running}
                >
                  <option value="">No category (add them to a category later)</option>
                  {categories.map((c) => (
                    <option key={c._key} value={c._key}>
                      {c.title}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>＋ New category…</option>
                </Select>
                {categoryChoice === NEW_CATEGORY && (
                  <TextInput
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.currentTarget.value)}
                    placeholder="Name of the new category, e.g. Portraits"
                    disabled={running}
                  />
                )}
                <Text size={1} muted>
                  Everything added below goes into this category, at the end, in the order it was queued.
                </Text>
              </Stack>
            )}
            <Flex as="label" align="center" gap={2}>
              <Checkbox checked={keepHidden} onChange={(e) => setKeepHidden(e.currentTarget.checked)} disabled={running} />
              <Text size={1}>Keep them hidden from the website until I&apos;ve checked them</Text>
            </Flex>
          </Stack>
        </Card>

        <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
          <Card
            padding={4}
            radius={3}
            border
            tone={dragging ? "primary" : "default"}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <Stack gap={4}>
              <Text weight="medium">From this computer</Text>
              <Text size={1} muted>
                Drop files here, or pick them.
              </Text>
              <Flex gap={2} wrap="wrap">
                <Button text="Choose files" mode="ghost" disabled={running} onClick={() => filesInput.current?.click()} />
                <Button
                  text="Choose a folder"
                  icon={FolderUp}
                  mode="ghost"
                  disabled={running}
                  onClick={() => folderInput.current?.click()}
                />
              </Flex>
              <input
                ref={filesInput}
                type="file"
                multiple
                accept={ACCEPT[target]}
                hidden
                onChange={(e) => e.currentTarget.files && queueFiles(e.currentTarget.files)}
              />
              <input
                ref={(el) => {
                  folderInput.current = el;
                  /* Not in React's types: lets the picker take a whole folder. */
                  el?.setAttribute("webkitdirectory", "");
                }}
                type="file"
                hidden
                onChange={(e) => e.currentTarget.files && queueFiles(e.currentTarget.files)}
              />
            </Stack>
          </Card>

          <Card padding={4} radius={3} border>
            <Stack gap={4}>
              <Text weight="medium">From a Google Drive folder</Text>
              {!API_KEY ? (
                <Text size={1} muted>
                  Not set up: the studio needs a Google API key. Ask Jed.
                </Text>
              ) : (
                <form onSubmit={openDrive}>
                  <Stack gap={2}>
                    <TextInput
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.currentTarget.value)}
                      placeholder="https://drive.google.com/drive/folders/…"
                      disabled={running}
                    />
                    <Text size={1} muted>
                      The folder must be shared as &quot;Anyone with the link&quot;.
                    </Text>
                    <Flex>
                      <Button type="submit" text="Open folder" mode="ghost" loading={driveLoading} disabled={running} />
                    </Flex>
                  </Stack>
                </form>
              )}
              {driveError && (
                <Card padding={3} radius={2} tone="critical">
                  <Text size={1}>{driveError}</Text>
                </Card>
              )}
            </Stack>
          </Card>
        </Grid>

        {driveItems && (
          <Card padding={4} radius={3} border>
            <Stack gap={4}>
              <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                <Text weight="medium">
                  {picked.size} of {driveItems.length} {plural} selected
                </Text>
                <Flex gap={2}>
                  <Button
                    mode="bleed"
                    text={picked.size === driveItems.length ? "Select none" : "Select all"}
                    onClick={() =>
                      setPicked(picked.size === driveItems.length ? new Set() : new Set(driveItems.map((i) => i.id)))
                    }
                  />
                  <Button tone="primary" text="Add to the list below" disabled={!picked.size} onClick={queueDrive} />
                </Flex>
              </Flex>
              {driveItems.length === 0 && (
                <Text size={1} muted>
                  No {plural} in that folder (subfolders aren&apos;t included; open each one).
                </Text>
              )}
              <Grid gridTemplateColumns={[3, 4, 6]} gap={2}>
                {driveItems.map((item) => {
                  const on = picked.has(item.id);
                  return (
                    <Card
                      key={item.id}
                      as="button"
                      radius={2}
                      padding={1}
                      border
                      tone={on ? "primary" : "default"}
                      onClick={() => {
                        const next = new Set(picked);
                        if (on) next.delete(item.id);
                        else next.add(item.id);
                        setPicked(next);
                      }}
                      style={{ cursor: "pointer", opacity: on ? 1 : 0.45 }}
                    >
                      <Stack gap={1}>
                        <Box style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 3, background: "#f2f2f5" }}>
                          {thumbUrl(item) && (
                            <img
                              src={thumbUrl(item, 300)}
                              alt=""
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </Box>
                        <Text size={0} textOverflow="ellipsis">
                          {item.name}
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </Grid>
            </Stack>
          </Card>
        )}

        {jobs.length > 0 && (
          <Card padding={4} radius={3} border>
            <Stack gap={4}>
              <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                <Text weight="medium">
                  {done} of {jobs.length} added
                </Text>
                <Flex gap={2}>
                  <Button
                    mode="bleed"
                    text="Clear list"
                    disabled={running}
                    onClick={() => setJobs([])}
                  />
                  <Button
                    tone="primary"
                    text={running ? "Adding…" : `Add ${waiting} ${waiting === 1 ? singular : plural}`}
                    loading={running}
                    disabled={running || !waiting || (categoryChoice === NEW_CATEGORY && !newCategory.trim())}
                    onClick={run}
                  />
                </Flex>
              </Flex>
              {categoryReport && (
                <Card padding={3} radius={2} tone={categoryReport.ok ? "positive" : "critical"}>
                  <Text size={1}>{categoryReport.text}</Text>
                </Card>
              )}
              <Stack gap={2}>
                {jobs.map((j) => (
                  <Card
                    key={j.key}
                    padding={2}
                    radius={2}
                    tone={
                      j.status === "failed"
                        ? "critical"
                        : j.status === "done"
                          ? j.warned
                            ? "caution"
                            : "positive"
                          : "default"
                    }
                  >
                    <Flex justify="space-between" gap={3}>
                      <Text size={1} textOverflow="ellipsis">
                        {j.name} <span style={{ opacity: 0.6 }}>· {formatSize(j.size)}</span>
                      </Text>
                      <Text size={1} muted>
                        {j.note ?? { waiting: "waiting", working: "working…", done: "added", failed: "failed" }[j.status]}
                      </Text>
                    </Flex>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

export const bulkAddTool: Tool = {
  name: "bulk-add",
  title: "Bulk add",
  icon: FolderUp,
  component: BulkAdd,
};
