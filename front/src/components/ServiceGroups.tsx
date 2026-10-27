import { ACCENT_TINT, FONT_DISPLAY, INK } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";

/* Photo-topped cards on a dark band: the picture does the explaining, the
   tinted panel below carries the copy. The cards sit close together so the
   row reads as one strip of work. */
export default async function ServiceGroups() {
  const { services } = await getContent();

  return (
    <section className="px-5 py-14 sm:px-8 lg:py-20" style={{ backgroundColor: INK }}>
      <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {services.groups.map((g, i) => (
          <Reveal key={g.title} delay={i * 90}>
            <article className="group flex h-full flex-col overflow-hidden rounded-lg" style={{ backgroundColor: ACCENT_TINT }}>
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={g.photo}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col px-7 pb-9 pt-8 lg:px-8">
                <h2
                  className="text-3xl font-semibold leading-[1.05] tracking-tight lg:text-4xl"
                  style={{ fontFamily: FONT_DISPLAY, color: INK }}
                >
                  {g.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[rgb(10,11,16)]/75">{g.body}</p>
                <ul className="mt-auto flex flex-wrap gap-2 pt-8">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-white/60 px-3.5 py-1.5 text-sm font-semibold"
                      style={{ color: INK }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
