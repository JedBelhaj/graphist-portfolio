import { Camera, Clapperboard, Megaphone, TrendingUp } from "lucide-react";
import { ACCENT, ACCENT_WASH, FONT_DISPLAY } from "@/lib/brand";
import { SERVICE_GROUPS } from "@/lib/content";
import Reveal from "./Reveal";

/* Icons pair with SERVICE_GROUPS by index — keep the order in step. */
const ICONS = [Camera, Clapperboard, Megaphone, TrendingUp];

export default function ServiceGroups() {
  return (
    <section className="bg-white px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {SERVICE_GROUPS.map((g, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal key={g.title} delay={(i % 2) * 110}>
              <div className="flex h-full flex-col rounded-3xl border border-black/10 p-8 transition-colors duration-300 hover:border-[rgb(124,92,252)] lg:p-10">
                <div className="mb-8 flex items-center justify-between">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: ACCENT_WASH, color: ACCENT }}
                  >
                    <Icon size={26} />
                  </span>
                  <span className="text-sm tabular-nums text-[rgb(122,122,132)]">0{i + 1}</span>
                </div>
                <h2
                  className="text-3xl font-bold tracking-tight text-[rgb(10,11,16)] lg:text-4xl"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {g.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[rgb(74,74,86)]">{g.body}</p>
                <ul className="mt-8 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[rgb(10,11,16)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
