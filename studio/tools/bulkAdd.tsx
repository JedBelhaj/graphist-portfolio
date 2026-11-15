/* "Bulk add" tab in the studio: turns a whole folder of photos, videos or client
   message screenshots into items in one go, instead of creating them one at a
   time.

   Files come from this computer (pick files, pick a folder, or drop them in)
   or from a shared Google Drive folder (lib/drive.ts). Each one is uploaded
   and becomes its own document, added to the end of that list, where it can
   then be reordered, hidden or edited like any other.

   Videos go to Mux, like an upload in a video's Video field (lib/muxUpload.ts):
   Mux makes the sizes, the still and the looping preview, and reports whether
   it's vertical, so nothing is compressed or prepared here. Uploads run a few
   at a time; a failed file doesn't stop the rest.

   Photos and videos can also go straight into a category: pick one (or type a
   new one) for the whole batch, and each item is created with it. They land
   at the end of their list, in the order they were queued, which is also
   their order inside the category. */
import { Box, Button, Card, Checkbox, Container, Flex, Grid, Heading, Select, Stack, Text, TextInput } from "@sanity/ui";
import { LexoRank } from "lexorank";
import { FolderUp } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { useClient, type Tool } from "sanity";
import { uploadToMux } from "../lib/muxUpload";
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
  /* Mux takes nearly any video format, so no need to narrow it down. */
  video: "video/*",
  result: "image/*",
};

const PARALLEL = 3;

/* The category document type for each kind that has categories. */
const CATEGORY_TYPES: Partial<Record<Target, string>> = {
  photo: "photoCategory",
  video: "videoCategory",
};

const NEW_CATEGORY = "__new__";

type Category = { _id: string; title: string };

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


function BulkAdd() {
  const client = useClient({ apiVersion: "2026-10-13" });
  const [target, setTarget] = useState<Target>("photo");
  const [keepHidden, setKeepHidden] = useState(false);
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

  /* "" = no category, NEW_CATEGORY = the name typed below, else a category's _id. */
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryChoice, setCategoryChoice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryReport, setCategoryReport] = useState<{ ok: boolean; text: string } | null>(null);
  const categoryType = CATEGORY_TYPES[target];

  /* The categories in their site order, including ones not published yet
     (drafts perspective: one row each, IDs without "drafts."). */
  async function loadCategories(): Promise<Category[]> {
    if (!categoryType) return [];
    const rows = await client
      .withConfig({ perspective: "drafts" })
      .fetch<Category[]>(`*[_type == $type && defined(title)] | order(orderRank){ _id, title }`, { type: categoryType });
    return rows;
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

  /* The batch's category: an existing one, or a new one created now (at the
     end of the categories), unless one with that name already exists. */
  async function resolveCategory(): Promise<Category | null> {
    if (!categoryType || !categoryChoice) return null;
    if (categoryChoice !== NEW_CATEGORY) return categories.find((c) => c._id === categoryChoice) ?? null;
    const typed = newCategory.trim();
    const same = categories.find((c) => c.title.trim().toLowerCase() === typed.toLowerCase());
    if (same) return same;
    const last = await client.fetch<string | null>(`*[_type == $type] | order(orderRank desc)[0].orderRank`, {
      type: categoryType,
    });
    const created = await client.create({
      _type: categoryType,
      title: typed,
      hidden: false,
      orderRank: (last ? LexoRank.parse(last) : LexoRank.middle()).genNext().toString(),
    });
    return { _id: created._id, title: typed };
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
  async function addOne(job: Job, orderRank: string, category: Category | null): Promise<string> {
    update(job.key, { status: "working", note: undefined });
    const categoryRef: Record<string, unknown> = category
      ? { category: { _type: "reference", _ref: category._id, _weak: true } }
      : {};
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
        ...(target === "photo" ? categoryRef : {}),
        image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
      });
      update(job.key, { status: "done", note: undefined });
      return created._id;
    }

    /* Straight to Mux; it makes the still, the preview and the sizes. */
    const muxAsset = await uploadToMux(client, file, (fraction) =>
      update(job.key, { note: `uploading ${Math.round(fraction * 100)}%` }),
    );
    const created = await client.create({
      _type: "video",
      orderRank,
      title: titleFrom(job.name),
      ...(keepHidden ? { hidden: true } : {}),
      ...categoryRef,
      muxVideo: { _type: "mux.video", asset: { _type: "reference", _weak: true, _ref: muxAsset } },
    });
    update(job.key, { status: "done", note: "added; Mux is still processing it (a minute or two)" });
    return created._id;
  }

  async function run() {
    const todo = jobs.filter((j) => j.status === "waiting" || j.status === "failed");
    if (!todo.length) return;
    setRunning(true);
    setCategoryReport(null);

    let chosen: Category | null;
    try {
      chosen = await resolveCategory();
    } catch (err) {
      setCategoryReport({
        ok: false,
        text: `Couldn’t create the category (${err instanceof Error ? err.message : String(err)}). Nothing was added.`,
      });
      setRunning(false);
      return;
    }

    /* Ranks after the current last item, so the new ones land at the end of
       the list, and of their category, in the order they were queued. */
    const last = await client.fetch<string | null>(`*[_type == $type] | order(orderRank desc)[0].orderRank`, {
      type: target,
    });
    let rank = last ? LexoRank.parse(last) : LexoRank.min();
    const ranks = todo.map(() => (rank = rank.genNext().genNext()).toString());

    let added = 0;
    let next = 0;
    const worker = async () => {
      while (next < todo.length) {
        const i = next++;
        try {
          await addOne(todo[i], ranks[i], chosen);
          added++;
        } catch (err) {
          update(todo[i].key, { status: "failed", note: err instanceof Error ? err.message : String(err) });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, todo.length) }, worker));

    if (chosen && added) {
      setCategoryReport({ ok: true, text: `${added} added to the category “${chosen.title}”.` });
      /* A new category now exists: list it, and keep the batch pointed at it. */
      const list = await loadCategories().catch(() => null);
      if (list) {
        setCategories(list);
        setCategoryChoice(chosen._id);
        setNewCategory("");
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
              <Text size={1} muted>
                Full videos, any length: each one streams from Mux, which also makes its still and its looping preview
                and works out whether it&apos;s vertical. Titles come from the file names; change them afterwards. Keep
                this tab open until the list says they&apos;re all added.
              </Text>
            )}
            {categoryType && (
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
                    <option key={c._id} value={c._id}>
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
