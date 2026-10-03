import { SERVICES } from "@/lib/content";
import Button from "./Button";
import PlayMark from "./PlayMark";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* What we do, as a numbered index — two columns of ruled rows, like a shot
   list. Hovering a row slides the play mark in and turns it red. The full
   breakdown lives on /services; this is the table of contents. */
export default function Services() {
  return (
    <section id="services" className="bg-wash px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead
          index="04"
          label="Services"
          title="Everything"
          script="it takes."
          aside="Twelve things we do, under one roof. Pick the pieces you need, or hand over the whole content side."
        />

        <ol className="grid grid-cols-1 border-t border-ink/15 md:grid-cols-2 md:gap-x-12">
          {SERVICES.map((s, i) => (
            <li key={s} className="border-b border-ink/15">
              <Reveal delay={(i % 6) * 50}>
                <div className="group flex items-center gap-5 py-5 lg:py-6">
                  <span className="readout w-7 shrink-0 text-muted transition-colors group-hover:text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display flex-1 text-xl text-ink transition-transform duration-300 group-hover:translate-x-1 lg:text-2xl">
                    {s}
                  </span>
                  <PlayMark className="-translate-x-2 text-sm text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-12 lg:mt-14">
          <Button href="/services" variant="ink">
            See all services
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
