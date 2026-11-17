import { Plus } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";
import Link from "next/link";

/* Native <details> rather than a JS accordion: keyboard, screen reader and
   find-in-page support come free, and it works before hydration.

   `embedded` is the version under the contact form: it brings its own
   heading (the FAQ page's hero text from the studio) and drops the
   "Still have a question? → contact" box, since you're already there. */
export default async function Faq({ embedded = false }: { embedded?: boolean }) {
  const { faq } = await getContent();

  return (
    <section
      id={embedded ? "faq" : undefined}
      className={`scroll-mt-24 bg-white px-5 pb-20 sm:px-8 lg:pb-28 ${embedded ? "pt-16 lg:pt-24" : ""}`}
    >
      {embedded && (
        <div className="mx-auto mb-10 max-w-[880px]">
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-[0.22em]"
            style={{ color: ACCENT }}
          >
            {faq.hero.eyebrow}
          </p>
          <h2
            className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[rgb(10,11,16)] sm:text-5xl"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {faq.hero.title}
            {faq.hero.accent && (
              <span className="block" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
                {faq.hero.accent}
              </span>
            )}
          </h2>
        </div>
      )}
      <div className="mx-auto max-w-[880px] border-t border-black/10">
        {faq.faqs.map((f, i) => (
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

        {!embedded && (
        <Reveal>
          <div className="mt-14 flex flex-col items-center gap-5 rounded-3xl bg-[rgb(238,234,255)] p-10 text-center">
            <p
              className="text-2xl font-semibold tracking-tight text-[rgb(10,11,16)]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {faq.ctaTitle}
            </p>
            <Link
              href="/contact"
              className="rounded-full bg-[rgb(10,11,16)] px-6 py-3 text-base font-medium text-white transition-transform hover:scale-[1.03]"
            >
              {faq.ctaButton}
            </Link>
          </div>
        </Reveal>
        )}
      </div>
    </section>
  );
}
