import { Check } from "lucide-react";
import { BRAND, FONT_SCRIPT } from "@/lib/brand";
import { FOUNDER_PORTRAIT } from "@/lib/content";
import FooterCol from "./FooterCol";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer id="contact" className="bg-[rgb(10,11,16)] px-5 pb-12 sm:px-8 lg:px-[72px]">
      <div className="mx-auto max-w-[1180px]">
        {/* CTA card */}
        <div className="mb-12 flex flex-col items-center gap-6 rounded-2xl bg-[rgb(167,68,255)] p-8 text-center lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
          <Logo className="shrink-0" color="rgb(254,254,254)" />
          <h3
            className="text-3xl font-normal leading-tight tracking-tight text-[rgb(254,254,254)]"
            style={{ fontFamily: FONT_SCRIPT }}
          >
            Ready to look the part?
          </h3>
          <a
            href={`mailto:${BRAND.email}`}
            className="rounded-full bg-[rgb(254,254,254)] px-6 py-2.5 text-base font-medium text-[rgb(167,68,255)] transition-transform hover:scale-[1.03]"
          >
            Let&apos;s Chat
          </a>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="relative col-span-2 aspect-[2.88/3.2] max-w-[272px] overflow-hidden rounded-xl">
            <img
              src={FOUNDER_PORTRAIT}
              alt={`${BRAND.founder}, founder of ${BRAND.name}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-[rgb(10,11,16)] px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="text-base font-semibold text-[rgb(254,254,254)]">
                  {BRAND.founder}
                </span>
                <Check size={14} className="text-[rgb(167,68,255)]" />
              </div>
              <div className="text-sm text-[rgb(254,254,254)]">Behind the lens &amp; the plan</div>
            </div>
          </div>

          <FooterCol
            title="Navigation"
            links={[
              ["Services", "#services"],
              ["Work", "#work"],
              ["Testimonial", "#testimonial"],
              ["About us", "#about"],
            ]}
          />
          <FooterCol
            title="Connect"
            links={[
              ["Instagram", BRAND.instagram],
              ["LinkedIn", BRAND.linkedin],
              [BRAND.email, `mailto:${BRAND.email}`],
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-4 border-t border-[rgb(254,254,254)]/40 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-[rgb(254,254,254)]">
            &copy; {BRAND.year} {BRAND.name}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[rgb(254,254,254)] underline">Terms</a>
            <a href="#" className="text-[rgb(254,254,254)] underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
