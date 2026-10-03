import { Plus } from "lucide-react";
import { FAQS } from "@/lib/content";
import Button from "./Button";
import Reveal from "./Reveal";

/* Native <details> rather than a JS accordion: keyboard, screen reader and
   find-in-page support come free, and it works before hydration. */
export default function Faq() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1000px] border-t border-ink">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 60}>
            <details className="group border-b border-ink/15">
              <summary className="flex cursor-pointer list-none items-center gap-5 py-6 lg:py-7 [&::-webkit-details-marker]:hidden">
                <span className="readout w-7 shrink-0 text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="display flex-1 text-xl text-ink lg:text-2xl">{f.q}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/20 text-ink transition-[transform,background-color,color] duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-white">
                  <Plus size={18} />
                </span>
              </summary>
              <p className="max-w-2xl pb-8 pl-12 text-base leading-relaxed text-muted">{f.a}</p>
            </details>
          </Reveal>
        ))}

        <Reveal>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 bg-ink p-8 sm:flex-row sm:items-center lg:p-10">
            <p className="display text-2xl text-white lg:text-3xl">Still have a question?</p>
            <Button href="#contact" variant="brand">
              Ask us directly
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
