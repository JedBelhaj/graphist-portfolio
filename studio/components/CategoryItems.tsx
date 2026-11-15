/* The "Videos / Photos in this category" panel of a category document: the
   category from its own side, next to the Category field on each item.

   It stores nothing on the category. Every change is made on the items
   themselves (their `category` and `orderRank`), on the published document
   and its draft if it has one, so the two sides can never disagree:

   - the items in this category, in site order, each with up / down / remove;
   - "New … in this category", which opens a new item with the category set;
   - every other item as a thumbnail: click one to move it in here (it goes
     to the end).

   Order inside a category is the items' drag order (orderRank), the same as
   in the full Videos / Photos list; moving one here gives it a rank between
   its new neighbours. */
import { Box, Button, Card, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { LexoRank } from "lexorank";
import { ArrowDown, ArrowUp, Film, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient, useFormValue, type StringInputProps } from "sanity";
import { IntentLink } from "sanity/router";

type Kind = "video" | "photo";

type Row = {
  _id: string;
  title?: string;
  hidden?: boolean;
  orderRank?: string;
  cat?: string;
  catTitle?: string;
  thumb?: string;
  playbackId?: string;
};

/* Drafts perspective: one row per item, its draft if it has one, so items
   that aren't published yet are listed too. */
const QUERY = `*[_type == $type] | order(orderRank) {
  _id, "title": coalesce(title, alt), hidden, orderRank,
  "cat": category._ref, "catTitle": category->title,
  "thumb": coalesce(poster.asset->url, image.asset->url),
  "playbackId": muxVideo.asset->playbackId
}`;

const WORDS: Record<Kind, { one: string; many: string; template: string }> = {
  video: { one: "video", many: "videos", template: "video-in-category" },
  photo: { one: "photo", many: "photos", template: "photo-in-category" },
};

const thumbUrl = (r: Row) =>
  r.thumb
    ? `${r.thumb}?w=240&h=240&fit=crop&auto=format`
    : r.playbackId
      ? `https://image.mux.com/${r.playbackId}/thumbnail.webp?time=0&width=240`
      : undefined;

const rank = (r: Row | undefined) => (r?.orderRank ? LexoRank.parse(r.orderRank) : undefined);

function Thumb({ row, size }: { row: Row; size: number | string }) {
  const url = thumbUrl(row);
  return (
    <Box
      style={{
        width: size,
        aspectRatio: "1",
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 3,
        background: "var(--card-muted-bg-color, #f2f2f5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {url ? (
        <img src={url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Film size={18} opacity={0.5} />
      )}
    </Box>
  );
}

function CategoryItems({ kind }: { kind: Kind }) {
  const words = WORDS[kind];
  const raw = useClient({ apiVersion: "2026-10-13" }).withConfig({ perspective: "raw" });
  const drafts = useMemo(() => raw.withConfig({ perspective: "drafts" }), [raw]);
  const formId = useFormValue(["_id"]) as string | undefined;
  const categoryId = formId?.replace(/^drafts\./, "");

  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await drafts.fetch<Row[]>(QUERY, { type: kind }));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [drafts, kind]);

  useEffect(() => {
    load();
    /* Catch changes made elsewhere (another tab, the item's own form). */
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  /* Applies the change to the published item and its draft, whichever exist. */
  async function patchItem(id: string, change: { set?: Record<string, unknown>; unset?: string[] }) {
    setBusy(id);
    try {
      const ids = await raw.fetch<string[]>(`*[_id in [$id, "drafts." + $id]]._id`, { id });
      const tx = raw.transaction();
      for (const docId of ids) {
        tx.patch(docId, (p) => {
          let q = p;
          if (change.set) q = q.set(change.set);
          if (change.unset) q = q.unset(change.unset);
          return q;
        });
      }
      await tx.commit();
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (!categoryId) return null;

  if (failed) {
    return (
      <Card tone="critical" padding={3} radius={2}>
        <Text size={1}>Couldn’t load the {words.many}. Reload the page and try again.</Text>
      </Card>
    );
  }

  if (!rows) {
    return (
      <Flex padding={4} justify="center">
        <Spinner />
      </Flex>
    );
  }

  const mine = rows.filter((r) => r.cat === categoryId);
  /* Items with no category first: they're the likeliest to be added. */
  const others = rows.filter((r) => r.cat !== categoryId).sort((a, b) => Number(Boolean(a.cat)) - Number(Boolean(b.cat)));
  const ref = { _type: "reference", _ref: categoryId, _weak: true };

  /* To the end of the category, and of the full list, so it can't jump
     ahead of anything. */
  const add = (row: Row) => {
    const last = rows.reduce<LexoRank | undefined>((max, r) => {
      const x = rank(r);
      return x && (!max || x.compareTo(max) > 0) ? x : max;
    }, undefined);
    return patchItem(row._id, { set: { category: ref, orderRank: (last ?? LexoRank.middle()).genNext().toString() } });
  };

  const move = (i: number, step: -1 | 1) => {
    const j = i + step;
    /* The new neighbours: above and below the slot it moves into. */
    const [before, after] = step < 0 ? [rank(mine[j - 1]), rank(mine[j])] : [rank(mine[j]), rank(mine[j + 1])];
    const next = before && after ? before.between(after) : before ? before.genNext() : after ? after.genPrev() : LexoRank.middle();
    return patchItem(mine[i]._id, { set: { orderRank: next.toString() } });
  };

  return (
    <Stack gap={4}>
      <Card padding={3} radius={2} border>
        <Stack gap={3}>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <Text size={1} weight="medium">
              {mine.length} {mine.length === 1 ? words.one : words.many}, in the order the site shows them
            </Text>
            <Button
              as={IntentLink}
              intent="create"
              params={[{ type: kind, template: words.template }, { categoryId }]}
              icon={Plus}
              mode="ghost"
              fontSize={1}
              padding={2}
              text={`New ${words.one} in this category`}
            />
          </Flex>
          {mine.length === 0 && (
            <Text size={1} muted>
              Nothing in this category yet. Click {words.many} below to add them, or add a new one.
            </Text>
          )}
          {mine.map((r, i) => (
            <Flex key={r._id} align="center" gap={3}>
              <Thumb row={r} size={44} />
              <Box flex={1} style={{ minWidth: 0 }}>
                <Text size={1} textOverflow="ellipsis">
                  {[r.hidden ? "Hidden" : null, r.title || "Untitled"].filter(Boolean).join(" · ")}
                </Text>
              </Box>
              <Flex gap={1}>
                <Button
                  icon={ArrowUp}
                  mode="bleed"
                  padding={2}
                  title="Move up"
                  disabled={i === 0 || Boolean(busy)}
                  onClick={() => move(i, -1)}
                />
                <Button
                  icon={ArrowDown}
                  mode="bleed"
                  padding={2}
                  title="Move down"
                  disabled={i === mine.length - 1 || Boolean(busy)}
                  onClick={() => move(i, 1)}
                />
                <Button
                  icon={X}
                  mode="bleed"
                  tone="critical"
                  padding={2}
                  title="Take out of this category"
                  disabled={Boolean(busy)}
                  onClick={() => patchItem(r._id, { unset: ["category"] })}
                />
              </Flex>
            </Flex>
          ))}
        </Stack>
      </Card>

      {others.length > 0 && (
        <Stack gap={3}>
          <Text size={1} muted>
            Click a {words.one} to add it here. One in another category moves over.
          </Text>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))" }}>
            {others.map((r) => (
              <Card
                key={r._id}
                as="button"
                type="button"
                radius={2}
                padding={1}
                border
                disabled={Boolean(busy)}
                onClick={() => add(r)}
                aria-label={`Add ${r.title || words.one} to this category`}
                style={{ cursor: "pointer", textAlign: "left" }}
              >
                <Stack gap={1}>
                  <Thumb row={r} size="100%" />
                  <Text size={0} textOverflow="ellipsis">
                    {r.title || "Untitled"}
                  </Text>
                  <Text size={0} muted textOverflow="ellipsis">
                    {r.catTitle ?? "No category"}
                  </Text>
                </Stack>
              </Card>
            ))}
          </div>
        </Stack>
      )}
    </Stack>
  );
}

/* One per category type, for the schema's `components.input`. */
export function VideoCategoryItems(_props: StringInputProps) {
  return <CategoryItems kind="video" />;
}
export function PhotoCategoryItems(_props: StringInputProps) {
  return <CategoryItems kind="photo" />;
}
