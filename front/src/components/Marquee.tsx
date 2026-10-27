import Logo from "./Logo";

export default function Marquee({
  items,
  bg,
  textColor,
  duration = 30,
}: {
  items: string[];
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
        </div>
      ))}
    </div>
  );
  return (
    <div className="flex overflow-hidden py-6 sm:py-8" style={{ backgroundColor: bg }}>
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
