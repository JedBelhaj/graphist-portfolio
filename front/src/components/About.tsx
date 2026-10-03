import { STUDIO_PHOTO } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import Viewfinder from "./Viewfinder";

const PRINCIPLES = [
  {
    title: "Who we are",
    body: "A small production studio built around one stubborn idea: the people who shoot your content should also know what it's for. We started behind a camera, watched great footage die in the wrong hands, and built the marketing side so that stopped happening.",
  },
  {
    title: "What we do",
    body: "We shoot it, cut it, build the site for it and put it to work. Photography, video, web, short-form social, paid creative and the campaigns that carry them — one team from the brief to the reporting.",
  },
  {
    title: "Why it works",
    body: "No template packages and no three-vendor telephone game. The person framing the shot knows where it lands, so nothing gets lost between the studio, the editor and the media buyer.",
  },
];

/* How we work: three short principles as ruled columns, with an on-set frame
   alongside. */
export default function About() {
  return (
    <section id="how-we-work" className="bg-wash px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead label="How we work" title="One crew," script="start to finish." />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col lg:col-span-7">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-ink/15 py-8">
                  <span className="display text-3xl text-brand">{i + 1}</span>
                  <div>
                    <h3 className="display mb-3 text-2xl text-ink">{p.title}</h3>
                    <p className="text-base leading-relaxed text-muted">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="lg:col-span-5">
            <figure>
              <Viewfinder className="aspect-[4/5] w-full bg-ink">
                <img
                  src={STUDIO_PHOTO}
                  alt="On set with the Soltani Media crew"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </Viewfinder>
              <figcaption className="readout mt-4 flex justify-between text-muted">
                <span>On set</span>
                <span>Always rolling</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
