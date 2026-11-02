import { HERO_SLOGAN_STICKERS } from "@/lib/content";

/* The stickers scattered round the hero slogan. Three layers, so nothing
   fights: the outer one pops in and is the steady hover target, the middle one
   bobs (bubble-float), and the art itself leans on hover (globals.css). Desktop
   only: a phone has no room round the slogan and no hover to lean on. */
export default function HeroStickers({ delay, step }: { delay: number; step: number }) {
  return (
    <div aria-hidden="true" className="hidden lg:block">
      {HERO_SLOGAN_STICKERS.map((s, i) => (
        <div
          key={s.src}
          className={`pop-in slogan-sticker absolute z-10 ${s.cls}`}
          style={{ animationDelay: `${delay + i * step}ms`, "--lean": `${s.lean}deg` } as React.CSSProperties}
        >
          <div
            className="bubble-float"
            style={
              { "--float-dur": `${6 + i * 0.8}s`, "--float-delay": `${-i * 1.3}s` } as React.CSSProperties
            }
          >
            <img
              src={s.src}
              alt=""
              draggable={false}
              className="slogan-sticker-art w-full select-none drop-shadow-[0_8px_14px_rgba(22,28,39,0.2)]"
              style={{ rotate: `${s.tilt}deg` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
