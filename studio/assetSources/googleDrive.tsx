/* "Google Drive" in the Select menu of every image and file field.

   Paste the share link of a Drive file to import it, or of a folder to browse
   it: thumbnails of what's inside (subfolders open on click), and clicking a
   photo or video imports that one. The last folder opened is remembered, so
   the next time the dialog goes straight back to it.

   The file is downloaded in the browser through the Drive API (lib/drive.ts)
   and handed to Sanity's own uploader, so the result is an ordinary Sanity
   asset. Needs SANITY_STUDIO_GOOGLE_API_KEY (see .env.example). */
import { Box, Button, Card, Dialog, Flex, Grid, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import { ArrowLeft, Folder, HardDriveDownload } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AssetFromSource, AssetSource, AssetSourceComponentProps, ImageAsset } from "sanity";
import {
  API_KEY,
  downloadFile,
  driveUrl,
  formatSize,
  getItem,
  isAccepted,
  isFolder,
  listFolder,
  parseDriveLink,
  thumbUrl,
  type DriveItem,
} from "../lib/drive";

const LAST_FOLDER = "soltani:drive-last-folder";

function remembered() {
  try {
    return localStorage.getItem(LAST_FOLDER) ?? "";
  } catch {
    return "";
  }
}

function GoogleDriveDialog({ accept, assetType, onClose, onSelect }: AssetSourceComponentProps) {
  const [link, setLink] = useState(remembered);
  const [error, setError] = useState<string | null>(null);
  /* The folders opened, outermost first; empty when no folder is open. */
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<DriveItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ name: string; loaded: number; total: number } | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  /* Reopen the last folder straight away. */
  useEffect(() => {
    const last = parseDriveLink(link);
    if (API_KEY && last?.folder) void openFolder(last.id, null);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fresh() {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    return controller;
  }

  async function openFolder(id: string, name: string | null, parentPath = path) {
    const controller = fresh();
    setError(null);
    setLoading(true);
    try {
      const label = name ?? (await getItem(id, controller.signal)).name;
      const list = await listFolder(id, controller.signal);
      setItems(list);
      setPath(name === null ? [{ id, name: label }] : [...parentPath, { id, name: label }]);
      try {
        if (name === null) localStorage.setItem(LAST_FOLDER, `https://drive.google.com/drive/folders/${id}`);
      } catch {
        /* Storage blocked: the folder just won't be remembered. */
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  async function importItem(item: DriveItem) {
    const controller = fresh();
    setError(null);
    try {
      if (!isAccepted(item.mimeType, accept)) {
        throw new Error(`"${item.name}" is a ${item.mimeType} file, which this field doesn't take.`);
      }
      setProgress({ name: item.name, loaded: 0, total: Number(item.size ?? 0) });
      const file = await downloadFile(
        item,
        (loaded, total) => setProgress({ name: item.name, loaded, total }),
        controller.signal,
      );
      onSelect([
        {
          kind: "file",
          /* Typed as Sanity's schema `File`, but the uploader wants a DOM File. */
          value: file as unknown as AssetFromSource["value"],
          assetDocumentProps: {
            originalFilename: item.name,
            source: { name: "google-drive", id: item.id, url: driveUrl(item) },
          } as ImageAsset,
        },
      ]);
    } catch (err) {
      if (controller.signal.aborted) return;
      setProgress(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseDriveLink(link);
    if (!parsed) {
      setError("That doesn't look like a Google Drive link.");
      return;
    }
    if (parsed.folder) {
      await openFolder(parsed.id, null);
      return;
    }
    try {
      setError(null);
      await importItem(await getItem(parsed.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const busy = progress !== null;
  const percent = progress?.total ? Math.round((progress.loaded / progress.total) * 100) : null;
  const shown = (items ?? []).filter((i) => isFolder(i) || isAccepted(i.mimeType, accept));
  const hiddenCount = (items?.length ?? 0) - shown.length;

  return (
    <Dialog
      id="google-drive-import"
      header={`${assetType === "image" ? "Image" : "File"} from Google Drive`}
      onClose={onClose}
      width={path.length ? 3 : 1}
    >
      <Box padding={4}>
        {!API_KEY ? (
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>
              Importing from Drive isn&apos;t set up yet: the studio needs a Google API key. Ask Jed to add
              SANITY_STUDIO_GOOGLE_API_KEY and redeploy.
            </Text>
          </Card>
        ) : (
          <Stack gap={4}>
            <form onSubmit={submit}>
              <Stack gap={3}>
                <Text size={1} weight="medium">
                  Drive link to a file or a folder
                </Text>
                <Flex gap={2}>
                  <Box flex={1}>
                    <TextInput
                      value={link}
                      onChange={(e) => setLink(e.currentTarget.value)}
                      placeholder="https://drive.google.com/drive/folders/…"
                      disabled={busy}
                      autoFocus={!path.length}
                    />
                  </Box>
                  <Button type="submit" tone="primary" text="Open" disabled={busy || loading || !link.trim()} />
                </Flex>
                <Text size={1} muted>
                  In Drive: right-click the file or folder → Share → set General access to &quot;Anyone with the
                  link&quot; → Copy link.
                </Text>
              </Stack>
            </form>

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

            {path.length > 0 && (
              <Stack gap={3}>
                <Flex align="center" gap={2}>
                  {path.length > 1 && (
                    <Button
                      mode="bleed"
                      icon={ArrowLeft}
                      disabled={busy || loading}
                      onClick={() => {
                        const up = path.slice(0, -1);
                        void openFolder(up[up.length - 1].id, up[up.length - 1].name, up.slice(0, -1));
                      }}
                    />
                  )}
                  <Text size={1} weight="medium">
                    {path.map((p) => p.name).join(" / ")}
                  </Text>
                  {loading && <Spinner muted />}
                </Flex>

                {!loading && shown.length === 0 && (
                  <Text size={1} muted>
                    Nothing in this folder that this field takes.
                  </Text>
                )}

                <Grid gridTemplateColumns={[2, 3, 5]} gap={2}>
                  {shown.map((item) => (
                    <Card
                      key={item.id}
                      as="button"
                      radius={2}
                      border
                      padding={1}
                      disabled={busy || loading}
                      onClick={() => (isFolder(item) ? openFolder(item.id, item.name) : importItem(item))}
                      style={{ cursor: "pointer", textAlign: "left" }}
                    >
                      <Stack gap={2}>
                        <Flex
                          align="center"
                          justify="center"
                          style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 3, background: "#f2f2f5" }}
                        >
                          {isFolder(item) ? (
                            <Folder size={36} strokeWidth={1.5} />
                          ) : thumbUrl(item) ? (
                            <img
                              src={thumbUrl(item)}
                              alt=""
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <HardDriveDownload size={28} strokeWidth={1.5} />
                          )}
                        </Flex>
                        <Box paddingX={1} paddingBottom={1}>
                          <Text size={0} textOverflow="ellipsis">
                            {item.name}
                          </Text>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Grid>

                {hiddenCount > 0 && (
                  <Text size={0} muted>
                    {hiddenCount} other file{hiddenCount === 1 ? "" : "s"} in this folder aren&apos;t{" "}
                    {assetType === "image" ? "images" : "a type this field takes"}.
                  </Text>
                )}
              </Stack>
            )}

            <Flex justify="flex-end">
              <Button mode="ghost" text="Cancel" onClick={onClose} />
            </Flex>
          </Stack>
        )}
      </Box>
    </Dialog>
  );
}

export const googleDriveSource: AssetSource = {
  name: "google-drive",
  title: "Google Drive",
  icon: HardDriveDownload,
  component: GoogleDriveDialog,
};
