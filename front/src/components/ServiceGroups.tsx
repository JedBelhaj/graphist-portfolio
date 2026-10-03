import { Camera, Clapperboard, Megaphone, MonitorSmartphone, TrendingUp } from "lucide-react";
import { SERVICE_GROUPS } from "@/lib/content";
import Reveal from "./Reveal";

/* Icons pair with SERVICE_GROUPS by index — keep the order in step. */
const ICONS = [Camera, Clapperboard, MonitorSmartphone, Megaphone, TrendingUp];

/* The disciplines as ruled rows, read left to right like a call sheet:
   number, name, what it is, what's in it. */
export default function ServiceGroups() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px] border-t border-ink">
        {SERVICE_GROUPS.map((g, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal key={g.title} delay={i * 70}>
              <div className="group grid grid-cols-1 gap-5 border-b border-ink/15 py-10 lg:grid-cols-12 lg:gap-8 lg:py-12">
                <div className="flex items-center gap-4 lg:col-span-5">
                  <span className="readout text-brand">0{i + 1}</span>
                  <Icon size={22} className="text-ink/40 transition-colors group-hover:text-brand" />
                  <h2 className="display text-3xl text-ink lg:text-4xl">{g.title}</h2>
                </div>
                <p className="text-lg leading-relaxed text-muted lg:col-span-4">{g.body}</p>
                <ul className="flex flex-col gap-2 lg:col-span-3">
                  {g.items.map((item) => (
                    <li key={item} className="readout flex items-center justify-between border-b border-ink/10 pb-2 text-ink">
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
