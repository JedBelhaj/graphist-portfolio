import { WORK_IMAGES } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import Viewfinder from "./Viewfinder";

const SPANS = [
  "sm:col-span-3",
  "sm:col-span-3",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-3",
  "sm:col-span-3",
];

/* A mixed reel of recent frames across every lane. */
export default function Work() {
  return (
    <section className="bg-wash px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead label="Recent projects" title="Latest" script="frames." />

        {/* The span classes ride on the Reveal wrapper, since that is what
            the grid lays out. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          {WORK_IMAGES.map((src, i) => (
            <Reveal key={i} delay={i * 70} className={SPANS[i]}>
              <figure className="group">
                <Viewfinder className="aspect-[4/3] bg-ink">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </Viewfinder>
                <figcaption className="readout mt-3 text-muted">
                  Frame {String(i + 1).padStart(2, "0")}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
