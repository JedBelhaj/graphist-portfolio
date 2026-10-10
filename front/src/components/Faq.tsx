import { Plus } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/brand";
import { FAQS } from "@/lib/content";
import Reveal from "./Reveal";

/* Native <details> rather than a JS accordion: keyboard, screen reader and
   find-in-page support come free, and it works before hydration. */
export default function Faq() {
  return (
    <section className="bg-white px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="mx-auto max-w-[880px] border-t border-black/10">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 60}>
            <details className="group border-b border-black/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <span
                  className="text-xl font-semibold tracking-tight text-[rgb(10,11,16)] lg:text-2xl"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {f.q}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(238,234,255)] text-[rgb(124,92,252)] transition-transform duration-300 group-open:rotate-45">
                  <Plus size={20} />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-base leading-relaxed text-[rgb(74,74,86)]">{f.a}</p>
            </details>
          </Reveal>
        ))}

        <Reveal>
          <div className="mt-14 flex flex-col items-center gap-5 rounded-3xl bg-[rgb(238,234,255)] p-10 text-center">
            <p
              className="text-2xl font-semibold tracking-tight text-[rgb(10,11,16)]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Still have a question?
            </p>
            <a
              href="#contact"
              className="rounded-full bg-[rgb(10,11,16)] px-6 py-3 text-base font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Work with us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
