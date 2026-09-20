import { STAR } from "@/lib/content";

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
          <img src={STAR} alt="" className="mx-3 h-6 w-6 sm:mx-4 sm:h-8 sm:w-8" />
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
