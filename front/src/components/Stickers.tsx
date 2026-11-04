/* Die-cut stickers scattered round a heading. They sit flat and fresh; on
   hover they age and two corners peel back off the page (globals.css,
   .sticker-peel). The outer layer pops in and is the steady hover target, so
   the peel can't move the sticker out from under the cursor. Each `cls`
   carries its phone size and place, with lg: overrides for desktop. */
export type Sticker = { src: string; cls: string; tilt: number; lean: number };

/* One peeling corner: its shadow on the wall, then the flap itself, which
   folds over to show the paper backing. */
function Corner({ src, at }: { src: string; at: "br" | "tl" }) {
  return (
    <>
      <span className={`peel-shadow peel-${at}`} />
      <span className={`peel-flap peel-flap-${at}`}>
        <img src={src} alt="" draggable={false} className={`peel-front peel-${at}`} />
        <span className="peel-back-wrap">
          <span className={`peel-back peel-${at}`} />
        </span>
      </span>
    </>
  );
}

export default function Stickers({
  stickers,
  delay,
  step,
}: {
  stickers: Sticker[];
  delay: number;
  step: number;
}) {
  return (
    <div aria-hidden="true">
      {stickers.map((s, i) => (
        <div
          key={s.src}
          className={`pop-in floating-sticker pointer-events-auto absolute z-10 ${s.cls}`}
          style={{ animationDelay: `${delay + i * step}ms` }}
        >
          <div
            className="sticker-peel select-none"
            style={
              {
                "--src": `url(${s.src})`,
                "--tilt": `${s.tilt}deg`,
                "--lean": `${s.lean}deg`,
                "--flutter-delay": `${-i * 0.37}s`,
              } as React.CSSProperties
            }
          >
            <span className="peel-surface">
              <img src={s.src} alt="" draggable={false} className="peel-art" />
              <span className="peel-age" />
            </span>
            <Corner src={s.src} at="br" />
            <Corner src={s.src} at="tl" />
          </div>
        </div>
      ))}
    </div>
  );
}
