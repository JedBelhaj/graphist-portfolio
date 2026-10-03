import { BRAND } from "@/lib/brand";
import { COUNTRIES } from "@/lib/content";
import Button from "./Button";
import Eyebrow from "./Eyebrow";
import FooterCol from "./FooterCol";
import Logo from "./Logo";

/* The closing scene: one big line and the way to act on it, then the
   directory, then the full lockup across the bottom like an end card. */
export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-ink px-5 pt-20 text-white sm:px-8 lg:px-10 lg:pt-28">
      <div className="mx-auto max-w-[1220px]">
        {/* CTA */}
        <div className="flex flex-col gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end lg:justify-between lg:pb-20">
          <div>
            <Eyebrow dark className="mb-6">
              Next scene
            </Eyebrow>
            <h2 className="display max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)]">
              Let&apos;s make something{" "}
              <span className="script text-brand">worth watching.</span>
            </h2>
          </div>
          <div className="flex shrink-0 flex-col gap-4 lg:items-end">
            <Button href={`mailto:${BRAND.email}`} variant="brand">
              Book a discovery call
            </Button>
            <a
              href={`mailto:${BRAND.email}`}
              className="readout text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
            >
              {BRAND.email}
            </a>
          </div>
        </div>

        {/* Directory */}
        <div className="grid grid-cols-2 gap-10 py-14 lg:grid-cols-4 lg:py-16">
          <div className="col-span-2 max-w-sm">
            <p className="text-base leading-relaxed text-white/60">
              Photo, video, web and marketing from one crew — shot, cut and put to work for brands
              across {COUNTRIES.length} countries.
            </p>
          </div>
          <FooterCol
            title="Navigation"
            links={[
              ["Home", "/"],
              ["Services", "/services"],
              ["Photography", "/work/photography"],
              ["Videography", "/work/videography"],
              ["Web Design", "/work/web-design"],
              ["About us", "/about"],
              ["FAQ", "/faq"],
            ]}
          />
          <FooterCol
            title="Connect"
            links={[
              ["Instagram", BRAND.instagram],
              ["Facebook", BRAND.facebook],
              ["LinkedIn", BRAND.linkedin],
              ["Email", `mailto:${BRAND.email}`],
            ]}
          />
        </div>

        {/* End card */}
        <Logo variant="full" tone="light" className="w-full !h-auto opacity-95" />

        <div className="readout flex flex-col gap-4 py-8 text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {BRAND.year} {BRAND.name}
          </p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
