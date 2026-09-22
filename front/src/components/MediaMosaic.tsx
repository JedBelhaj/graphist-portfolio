import ParallaxImage from "./ParallaxImage";
import Reveal from "./Reveal";

/* Full-bleed mosaic: edge to edge, no gap between tiles and none around them.

   Rows are sized in vw rather than px so the whole thing scales with the
   viewport and the tiles keep their proportions instead of squashing.

   `spans` repeats over the items. Each pattern is built so its areas divide
   evenly by the column count at both breakpoints — otherwise the last row
   comes up short and the flush bottom edge breaks. Keep the item count a
   multiple of the pattern length. */
export default function MediaMosaic({
  items,
  spans,
  alt = "",
}: {
  items: string[];
  spans: string[];
  alt?: string;
}) {
  return (
    /* One Reveal around the whole grid, not one per tile: the mosaic is a
       single picture built out of nine pieces, and staggering them made it
       assemble itself in front of you. It arrives as one block instead.

       The low threshold matters here — the grid is several viewports tall on
       mobile, so it can never reach a high intersection ratio. */
    <Reveal>
      <div className="grid w-full auto-rows-[42vw] grid-cols-2 lg:auto-rows-[15vw] lg:grid-cols-4">
        {items.map((src, i) => (
          /* Plain grid item carrying the span classes. Stretched by default, so
             it takes the row height, which is what lets the frame inside
             resolve its h-full. */
          <div key={`${src}-${i}`} className={spans[i % spans.length]}>
            <ParallaxImage src={src} alt={alt} />
          </div>
        ))}
      </div>
    </Reveal>
  );
}
