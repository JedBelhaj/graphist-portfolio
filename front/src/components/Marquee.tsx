import Logo from "./Logo";

export default function Marquee({
  items,
  icons,
  bg,
  textColor,
  duration = 30,
}: {
  items: string[];
  /* Shown after each item. The belt repeats them, so it announces each name
     once as a single label instead of on every pass. */
  icons?: { src: string; name: string }[];
  bg: string;
  textColor?: string;
  duration?: number;
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <div key={i} className="flex items-center">
          {/* The nav's wordmark as the separator, kept small so the phrase
              stays the loudest thing on the line. */}
          <Logo className="mx-4 h-[7px] sm:mx-5 sm:h-2 lg:mx-6 lg:h-[10px]" />
          <span
            className="whitespace-nowrap text-lg font-bold uppercase sm:text-xl lg:text-2xl"
            style={{ color: textColor }}
          >
            {t}
          </span>
          {icons && (
            <div className="ml-4 flex items-center gap-3 sm:ml-5 sm:gap-4 lg:ml-6 lg:gap-5">
              {icons.map((icon) => (
                <img
                  key={icon.src}
                  src={icon.src}
                  alt=""
                  className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
  return (
    <div
      className="flex overflow-hidden py-6 sm:py-8"
      style={{ backgroundColor: bg }}
      role={icons ? "img" : undefined}
      aria-label={icons ? `${items[0]}: ${icons.map((icon) => icon.name).join(", ")}` : undefined}
    >
      <div
        className="flex animate-[marquee_var(--dur)_linear_infinite]"
        style={{ ["--dur" as string]: `${duration}s` }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}
