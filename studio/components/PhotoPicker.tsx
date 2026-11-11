/* The "Photos" field of a Photography category: every photo as a thumbnail you
   tick, instead of adding references one at a time.

   Click a photo to add it, click again to take it out. The number on a ticked
   photo is its place in the category (the order they were ticked in), which is
   the order the site shows them. To reorder, untick and tick again.

   Only published photos are listed: a photo that is still a draft has to be
   published first. Photos already in the category that are no longer listed
   (deleted, say) are left alone. */
import { Box, Button, Card, Flex, Spinner, Stack, Text } from "@sanity/ui";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { set, unset, useClient, type ArrayOfObjectsInputProps } from "sanity";

type PhotoRow = { _id: string; alt?: string; hidden?: boolean; url?: string };
type Ref = { _key: string; _type: "reference"; _ref: string; _weak?: boolean };

const QUERY = `*[_type == "photo" && !(_id in path("drafts.**")) && defined(image.asset)] | order(orderRank)
  { _id, alt, hidden, "url": image.asset->url }`;

const newKey = () => Math.random().toString(36).slice(2, 12);

export function PhotoPicker(props: ArrayOfObjectsInputProps) {
  const { value, onChange } = props;
  const client = useClient({ apiVersion: "2026-10-13" });
  const [photos, setPhotos] = useState<PhotoRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    client
      .fetch<PhotoRow[]>(QUERY)
      .then((rows) => live && setPhotos(rows))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [client]);

  const refs = (value ?? []) as unknown as Ref[];
  const position = new Map(refs.map((r, i) => [r._ref, i + 1]));

  const toggle = (id: string) => {
    const next = position.has(id)
      ? refs.filter((r) => r._ref !== id)
      : [...refs, { _key: newKey(), _type: "reference" as const, _ref: id, _weak: true }];
    onChange(next.length > 0 ? set(next) : unset());
  };

  if (failed) {
    return (
      <Card tone="critical" padding={3} radius={2}>
        <Text size={1}>Couldn’t load the photos. Reload the page and try again.</Text>
      </Card>
    );
  }

  if (!photos) {
    return (
      <Flex padding={4} justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (photos.length === 0) {
    return (
      <Card tone="caution" padding={3} radius={2}>
        <Text size={1}>No published photos yet. Add some in Photos (or Bulk add), then come back.</Text>
      </Card>
    );
  }

  return (
    <Stack gap={3}>
      <Flex align="center" justify="space-between" gap={3}>
        <Text size={1} muted>
          {refs.length} of {photos.length} selected
        </Text>
        <Flex gap={2}>
          <Button
            mode="ghost"
            fontSize={1}
            padding={2}
            text="Select all"
            disabled={refs.length >= photos.length}
            onClick={() => {
              const missing = photos.filter((p) => !position.has(p._id));
              const next = [
                ...refs,
                ...missing.map((p) => ({ _key: newKey(), _type: "reference" as const, _ref: p._id, _weak: true })),
              ];
              onChange(set(next));
            }}
          />
          <Button mode="ghost" fontSize={1} padding={2} text="Clear" disabled={refs.length === 0} onClick={() => onChange(unset())} />
        </Flex>
      </Flex>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))" }}>
        {photos.map((p) => {
          const n = position.get(p._id);
          const selected = n !== undefined;
          return (
            <Card
              key={p._id}
              as="button"
              type="button"
              radius={2}
              padding={1}
              border
              selected={selected}
              tone={selected ? "primary" : "default"}
              onClick={() => toggle(p._id)}
              aria-pressed={selected}
              aria-label={`${selected ? "Remove" : "Add"} ${p.alt || "photo"}`}
              style={{ cursor: "pointer", position: "relative", textAlign: "left" }}
            >
              <img
                src={p.url ? `${p.url}?w=240&h=240&fit=crop&auto=format` : undefined}
                alt=""
                loading="lazy"
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 2,
                  opacity: selected ? 1 : 0.8,
                }}
              />
              {selected && (
                <Flex
                  align="center"
                  justify="center"
                  gap={1}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    minWidth: 24,
                    height: 24,
                    padding: "0 6px",
                    borderRadius: 12,
                    background: "var(--card-focus-ring-color, #2276fc)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                  {n}
                </Flex>
              )}
              <Box paddingTop={1}>
                <Text size={0} muted textOverflow="ellipsis">
                  {[p.hidden ? "Hidden" : null, p.alt || "Untitled"].filter(Boolean).join(" · ")}
                </Text>
              </Box>
            </Card>
          );
        })}
      </div>
    </Stack>
  );
}
