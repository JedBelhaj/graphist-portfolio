import PlayMark from "./PlayMark";

const TONES = {
  brand: "bg-brand text-white",
  ink: "bg-ink text-white",
  wash: "bg-wash text-ink",
} as const;

/* A ticker band: words in the wide caps, separated by the logo's play mark.
   The row is rendered twice so the -50% translate loops without a seam. */
export default function Marquee({
  items,
  tone = "brand",
  duration = 30,
}: {
  items: string[];
  tone?: keyof typeof TONES;
  duration?: number;
}) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <div key={i} className="flex items-center">
          <span className="display whitespace-nowrap text-2xl sm:text-3xl lg:text-4xl">{t}</span>
          <PlayMark className="mx-6 text-base opacity-70 sm:mx-8 lg:text-lg" />
        </div>
      ))}
    </div>
  );

  return (
    <div className={`flex overflow-hidden py-5 sm:py-6 ${TONES[tone]}`}>
      <div
        className="marquee-track flex animate-[marquee_var(--dur)_linear_infinite]"
        style={{ ["--dur" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
