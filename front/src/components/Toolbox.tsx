import { FONT_DISPLAY } from "@/lib/brand";
import { TOOLBOX } from "@/lib/content";

export default function Toolbox() {
  return (
    <section className="bg-[rgb(239,239,239)] px-5 py-8 sm:px-8 lg:px-[72px]">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-8 lg:flex-row lg:justify-between">
        <h2
          className="text-xl font-bold tracking-tight text-[rgb(47,38,29)] lg:text-2xl"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          What&apos;s in our kit
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {TOOLBOX.map((src, i) => (
            <img key={i} src={src} alt="" className="h-5 sm:h-6" />
          ))}
        </div>
      </div>
    </section>
  );
}
