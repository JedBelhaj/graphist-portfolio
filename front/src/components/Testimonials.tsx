import { FONT_DISPLAY } from "@/lib/brand";
import { TESTIMONIALS } from "@/lib/content";

export default function Testimonials() {
  return (
    <section id="testimonial" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <h2
          className="mb-12 text-center text-4xl font-bold tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:mb-16 lg:text-[56px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          Wall Of Love
        </h2>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="flex w-[85vw] shrink-0 snap-start flex-col gap-5 rounded-[20px] border border-[rgb(41,41,41)] bg-[rgb(20,20,20)] p-6 sm:w-[420px] lg:w-[560px]"
            >
              {t.name && (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[rgb(227,227,227)]">
                    <img src={t.avatar!} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-medium tracking-tight text-white">{t.name}</div>
                    <div className="text-xs text-[rgb(143,143,143)]">{t.handle}</div>
                  </div>
                </div>
              )}
              <div className="h-px w-full bg-[rgb(41,41,41)]" />
              <p className="text-xs leading-relaxed text-[rgb(176,176,176)]">{t.quote}</p>
              {t.tag && (
                <div className="mt-auto">
                  <span className="rounded-full bg-[rgb(41,41,41)] px-3 py-1 text-xs text-[rgb(201,201,201)]">
                    {t.tag}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
