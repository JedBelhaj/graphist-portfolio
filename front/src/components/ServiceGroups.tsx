import { INK } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import LaneCard, { type LaneCardData } from "./LaneCard";
import Reveal from "./Reveal";

/* The same picture cards as the work teaser, on a dark band. Copy and tags
   come from the Services page in the studio; the pictures are the work
   lanes' (first photo, first video poster, first website shot), so both
   pages show the same three doors. The first three groups are photo, video
   and web in that order and link to their work page; any extra group falls
   back to its own studio photo and isn't a link. */
const KINDS = [
  { kind: "photo", href: "/work/photography" },
  { kind: "video", href: "/work/videography" },
  { kind: "web", href: "/work/web-design" },
] as const;

export default async function ServiceGroups() {
  const { services, work } = await getContent();
  const { photo, video, web } = work.lanes;
  const pictures = { photo: { img: photo.img }, video: { img: video.img }, web: { img: web.img, real: web.real } };

  const cards: LaneCardData[] = services.groups.map((g, i) => {
    const copy = { title: g.title, blurb: g.body, tags: g.items };
    const slot = KINDS[i];
    return slot
      ? { ...copy, kind: slot.kind, href: slot.href, ...pictures[slot.kind] }
      : { ...copy, kind: "photo", img: g.photo };
  });

  return (
    <section className="px-5 py-14 sm:px-8 lg:py-20" style={{ backgroundColor: INK }}>
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {cards.map((c, i) => {
          /* Same as the work teaser: Web Design takes the full row at md
             and goes landscape. */
          const wide = c.kind === "web";
          return (
            <Reveal key={c.title} delay={i * 90} className={wide ? "md:col-span-2 lg:col-span-1" : ""}>
              {/* The faint ring keeps the card's edge visible where its dark
                  bottom meets the dark band. */}
              <LaneCard
                lane={c}
                index={i}
                titleTag="h2"
                aspect={wide ? "md:aspect-[16/9] lg:aspect-[4/5]" : ""}
                className="ring-1 ring-white/10"
              />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
