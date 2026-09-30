import { Check } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT, INK } from "@/lib/brand";
import { PACKAGES } from "@/lib/content";
import Reveal from "./Reveal";

export default function Packages() {
  return (
    <section id="packages" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 text-center lg:mb-16">
          <Reveal>
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              Packages
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Pick your pace
              <span className="block text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                [or we&apos;ll build one]
              </span>
            </h2>
          </Reveal>
        </div>

        {/* items-stretch + h-full so the three cards share a height and their
            buttons line up along the bottom regardless of feature count. */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
          {PACKAGES.map((p, i) => {
            const dark = p.featured;
            return (
              <Reveal key={p.name} delay={i * 110}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-8 lg:p-10 ${
                    dark
                      ? "bg-[rgb(10,11,16)] text-white md:-my-4 md:py-12 lg:py-14"
                      : "border border-black/10 bg-white text-[rgb(10,11,16)]"
                  }`}
                >
                  {dark && (
                    <span
                      className="absolute right-6 top-6 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Most popular
                    </span>
                  )}

                  <div className="text-lg font-bold" style={{ fontFamily: FONT_DISPLAY }}>
                    {p.name}
                  </div>
                  <p className={`mt-2 text-base leading-relaxed ${dark ? "text-white/70" : "text-[rgb(74,74,86)]"}`}>
                    {p.pitch}
                  </p>

                  <div className="mt-8 flex items-baseline gap-2">
                    <span
                      className="text-5xl font-bold tracking-tight lg:text-6xl"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {p.price}
                    </span>
                    {p.cadence && (
                      <span className={dark ? "text-white/60" : "text-[rgb(122,122,132)]"}>{p.cadence}</span>
                    )}
                  </div>

                  <ul className="mb-10 mt-8 flex flex-col gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base">
                        <Check size={18} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
                        <span className={dark ? "text-white/90" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="mt-auto rounded-full px-6 py-3 text-center text-base font-medium transition-transform hover:scale-[1.03]"
                    style={dark ? { backgroundColor: ACCENT, color: "#fff" } : { backgroundColor: INK, color: "#fff" }}
                  >
                    {p.price === "Custom" ? "Let's talk" : "Work with us"}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <p className="mt-12 text-center text-sm text-[rgb(122,122,132)]">
            Need a one-off shoot instead? Every project can be quoted on its own.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
