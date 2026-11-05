import InViewGate from "./InViewGate";
import Stickers, { type Sticker } from "./Stickers";

/* Stickers slapped across the join between two sections, so they overlap both
   like the real thing. Dropped between sections in a page; it takes no height,
   so the layout is the same with or without it, and each sticker's top is
   measured from the join. Gated so the pop-in waits until it's on screen. */
export default function StickerSeam({ stickers }: { stickers: Sticker[] }) {
  return (
    <InViewGate className="pointer-events-none relative z-20 h-0">
      <Stickers stickers={stickers} delay={100} step={130} />
    </InViewGate>
  );
}
