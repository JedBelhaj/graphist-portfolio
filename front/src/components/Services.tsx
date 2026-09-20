import { FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { SERVICE_PERSON, SERVICES } from "@/lib/content";

const BUBBLE_POSITIONS = [
  "top-[-13%] right-[17%] w-[180px]",
  "right-[20%] bottom-[21%] w-[120px]",
  "right-[1%] bottom-[52%] w-[130px]",
  "right-[-1%] bottom-[9%] w-40",
  "right-[52%] bottom-[91%] w-[120px]",
  "right-[78%] bottom-[83%] w-[140px]",
  "right-[64%] bottom-[60%] w-[120px]",
  "right-[87%] bottom-[53%] w-[200px]",
  "right-[90%] bottom-[5%] w-[200px]",
  "right-[67%] bottom-[9%] w-[200px]",
  "right-[-3%] bottom-[89%] w-[120px]",
];

export default function Services() {
  return (
    <section id="services" className="px-5 pt-20 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-[940px]">
        <h2
          className="mb-12 text-center text-4xl font-semibold leading-tight tracking-tight text-[rgb(10,11,16)] sm:text-6xl lg:mb-16 lg:text-[84px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          THE SH** I GET DONE
          <span className="block text-2xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
            [aka what I do]
          </span>
        </h2>

        {/* Mobile / tablet: wrapped pills */}
        <div className="flex flex-wrap justify-center gap-3 lg:hidden">
          {SERVICES.map((s) => (
            <span
              key={s.label}
              className="rounded-full px-5 py-3 text-center text-sm font-bold"
              style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY }}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Desktop: photo with floating bubbles */}
        <div className="relative mx-auto hidden justify-center lg:flex">
          <img src={SERVICE_PERSON} alt="" className="max-h-[460px]" />
          {SERVICES.map((s, i) => (
            <div
              key={s.label}
              className={`absolute flex items-center justify-center rounded-full px-2 py-6 text-center text-base font-bold ${BUBBLE_POSITIONS[i]}`}
              style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY }}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
