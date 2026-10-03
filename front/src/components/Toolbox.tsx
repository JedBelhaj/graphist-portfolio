import { TOOLBOX } from "@/lib/content";

/* The kit, as a strip of names. */
export default function Toolbox() {
  return (
    <section className="bg-ink px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1220px] flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <h2 className="readout shrink-0 text-white/50">In the kit</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {TOOLBOX.map((t) => (
            <li key={t} className="display text-base text-white lg:text-lg">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
