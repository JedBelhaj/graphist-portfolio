/* Google Drive, read through the public API with SANITY_STUDIO_GOOGLE_API_KEY.

   Only works for files and folders shared as "Anyone with the link": the key
   identifies the studio, not a Google account, so it can't see anything
   private. Used by the "Google Drive" image/file source and by the "Bulk add"
   tool. Drive is only touched while importing; the result is an ordinary
   Sanity asset on the CDN. */

export const API_KEY = process.env.SANITY_STUDIO_GOOGLE_API_KEY ?? "";
const API = "https://www.googleapis.com/drive/v3/files";
const FOLDER = "application/vnd.google-apps.folder";

export type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
};

export const isFolder = (item: DriveItem) => item.mimeType === FOLDER;

/* Accepts the link shapes Drive hands out (/file/d/<id>/view, /drive/folders/<id>,
   open?id=<id>, uc?id=<id>) and a bare ID. */
export function parseDriveLink(link: string): { id: string; folder: boolean } | null {
  const text = link.trim();
  if (/^[\w-]{20,}$/.test(text)) return { id: text, folder: false };
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (!/(^|\.)google\.com$/.test(url.hostname)) return null;
  const folder = url.pathname.match(/\/folders\/([\w-]{20,})/)?.[1];
  if (folder) return { id: folder, folder: true };
  const id = url.pathname.match(/\/d\/([\w-]{20,})/)?.[1] ?? url.searchParams.get("id");
  return id ? { id, folder: false } : null;
}

/* Same rules as the <input accept> attribute: "image/*", "video/mp4,…", "". */
export function isAccepted(mimeType: string, accept: string) {
  const rules = accept.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  return (
    rules.length === 0 ||
    rules.some((r) => (r.endsWith("/*") ? mimeType.startsWith(r.slice(0, -1)) : mimeType === r))
  );
}

export function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const NOT_SHARED =
  "Drive didn't let us read that. In Drive, open Share → General access and choose \"Anyone with the link\", then try again.";

async function driveError(res: Response) {
  if (res.status === 404 || res.status === 401) return NOT_SHARED;
  const body = await res.json().catch(() => null);
  const message: string = body?.error?.message ?? res.statusText;
  if (/api key|API_KEY|has not been used|disabled/i.test(message)) {
    return `The Google API key isn't working (${message}). Ask Jed to check it.`;
  }
  return res.status === 403 ? `${NOT_SHARED} (${message})` : `Drive error ${res.status}: ${message}`;
}

const query = () => `supportsAllDrives=true&key=${encodeURIComponent(API_KEY)}`;

export async function getItem(id: string, signal?: AbortSignal): Promise<DriveItem> {
  const res = await fetch(`${API}/${id}?fields=id,name,mimeType,size,thumbnailLink&${query()}`, { signal });
  if (!res.ok) throw new Error(await driveError(res));
  return res.json();
}

/* Everything directly inside a folder, folders first, then by name. */
export async function listFolder(folderId: string, signal?: AbortSignal): Promise<DriveItem[]> {
  const items: DriveItem[] = [];
  let page = "";
  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `${API}?q=${q}&fields=nextPageToken,files(id,name,mimeType,size,thumbnailLink)` +
        `&pageSize=1000&includeItemsFromAllDrives=true&orderBy=folder,name&${query()}${page && `&pageToken=${page}`}`,
      { signal },
    );
    if (!res.ok) throw new Error(await driveError(res));
    const body: { files: DriveItem[]; nextPageToken?: string } = await res.json();
    items.push(...body.files);
    page = body.nextPageToken ?? "";
  } while (page);
  return items;
}

/* Downloads a file into memory as a DOM File, reporting progress so big videos
   don't look stuck. */
export async function downloadFile(
  item: DriveItem,
  onProgress?: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<File> {
  if (item.mimeType.startsWith("application/vnd.google-apps")) {
    throw new Error(`"${item.name}" is a Google Docs/Sheets/Slides file, not a photo or video.`);
  }
  const res = await fetch(`${API}/${item.id}?alt=media&${query()}`, { signal });
  if (!res.ok || !res.body) throw new Error(await driveError(res));

  const total = Number(item.size ?? 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress?.(loaded, total);
  }
  return new File(chunks, item.name, { type: item.mimeType });
}

export const driveUrl = (item: DriveItem) =>
  isFolder(item) ? `https://drive.google.com/drive/folders/${item.id}` : `https://drive.google.com/file/d/${item.id}/view`;

/* Drive's thumbnail links come sized s220; ask for a sharper one. */
export const thumbUrl = (item: DriveItem, size = 400) => item.thumbnailLink?.replace(/=s\d+$/, `=s${size}`);
