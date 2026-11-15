/* Sends a video file to Mux the way the Video field (sanity-plugin-mux-input)
   does, for Bulk add. Everything goes through Sanity's Mux add-on routes,
   which hold the Mux key (the dataset's secrets.mux), so the browser never
   needs it:

   1. POST /addons/mux/uploads/{dataset} with a fresh ID in MUX-Proxy-UUID:
      Sanity asks Mux for a direct-upload URL and starts the asset document
      (mux.videoAsset) under that ID;
   2. the file goes to that URL in chunks (@mux/upchunk, as the plugin does);
   3. once Mux has turned the upload into an asset, its details are written
      onto the asset document, the same fields the plugin writes.

   Returns the asset document's ID, for a video's `muxVideo` field. Mux keeps
   processing for a while after this; the site picks the video up once it's
   ready, like an upload in the field. Settings match muxInput() in
   sanity.config.ts. Plugin version 5.2.1; re-check these routes when it's
   upgraded. */
import { UpChunk } from "@mux/upchunk";
import type { SanityClient } from "sanity";

const PLUGIN_QUERY = { sanityVersion: "5.2.1" };

const SETTINGS = {
  input: [{ type: "video" }],
  advanced_playback_policies: [{ policy: "public" }],
  max_resolution_tier: "1080p",
  video_quality: "plus",
};

type Upload = { data?: { asset_id?: string; id?: string } };
type Asset = { data: { id: string; status: string; playback_ids?: { id: string }[] } & Record<string, unknown> };

/* `client` must be a studio client (useClient), which sends the editor's
   login with these requests. */
export async function uploadToMux(
  client: SanityClient,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<string> {
  const mux = client.withConfig({ apiVersion: "2024-03-05" });
  const dataset = mux.config().dataset;
  const id = crypto.randomUUID();

  const created = await mux.request<{ upload: { url: string } }>({
    url: `/addons/mux/uploads/${dataset}`,
    method: "POST",
    withCredentials: true,
    headers: { "MUX-Proxy-UUID": id, "Content-Type": "application/json" },
    body: SETTINGS,
    query: PLUGIN_QUERY,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const up = UpChunk.createUpload({ endpoint: created.upload.url, file, dynamicChunkSize: true });
      up.on("progress", (e) => onProgress(Number(e.detail) / 100));
      up.on("success", () => resolve());
      up.on("error", (e) => reject(new Error(e.detail?.message ?? "upload failed")));
      up.on("offline", () => up.pause());
      up.on("online", () => up.resume());
    });
  } catch (err) {
    /* Let Sanity and Mux drop the unfinished upload. */
    await mux
      .request({ url: `/addons/mux/uploads/${dataset}/${id}`, method: "DELETE", withCredentials: true, query: PLUGIN_QUERY })
      .catch(() => {});
    throw err;
  }

  /* Mux turns the finished upload into an asset within seconds. */
  let assetId: string | undefined;
  let uploadId: string | undefined;
  for (let i = 0; i < 30 && !assetId; i++) {
    const upload = await mux.request<Upload>({
      url: `/addons/mux/uploads/${dataset}/${id}`,
      method: "GET",
      withCredentials: true,
      query: PLUGIN_QUERY,
    });
    assetId = upload.data?.asset_id;
    uploadId = upload.data?.id;
    if (!assetId) await new Promise((r) => setTimeout(r, 2000));
  }
  if (!assetId) throw new Error("uploaded, but Mux didn't make an asset from it");

  const asset = await mux.request<Asset>({
    url: `/addons/mux/assets/${dataset}/data/${assetId}`,
    method: "GET",
    withCredentials: true,
    query: PLUGIN_QUERY,
  });

  await mux
    .transaction()
    .createIfNotExists({ _id: id, _type: "mux.videoAsset" })
    .patch(id, (p) =>
      p.set({
        status: asset.data.status,
        data: asset.data,
        assetId: asset.data.id,
        playbackId: asset.data.playback_ids?.[0]?.id,
        uploadId,
        filename: file.name,
      }),
    )
    .commit();

  return id;
}
