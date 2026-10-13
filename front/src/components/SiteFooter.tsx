import { Check } from "lucide-react";
import { FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import FooterCol from "./FooterCol";
import Logo from "./Logo";

export default async function SiteFooter() {
  const { brand, footer, images } = await getContent();

  return (
    <footer id="contact" className="bg-[rgb(10,11,16)] px-5 pb-12 sm:px-8 lg:px-[72px]">
      <div className="mx-auto max-w-[1180px]">
        {/* CTA card */}
        <div className="mb-12 flex flex-col items-center gap-6 rounded-2xl bg-[rgb(124,92,252)] p-8 text-center lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
          <Logo variant="full" tone="light" className="h-10 shrink-0 lg:h-11" />
          <h3
            className="text-3xl font-normal leading-tight tracking-tight text-[rgb(254,254,254)]"
            style={{ fontFamily: FONT_SCRIPT }}
          >
            {footer.cta}
          </h3>
          <a
            href={`mailto:${brand.email}`}
            className="rounded-full bg-[rgb(254,254,254)] px-6 py-2.5 text-base font-medium text-[rgb(124,92,252)] transition-transform hover:scale-[1.03]"
          >
            {footer.button}
          </a>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="relative col-span-2 aspect-[2.88/3.2] max-w-[272px] overflow-hidden rounded-xl">
            <img
              src={images.founder}
              alt={`${brand.founder}, founder of ${brand.name}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-[rgb(10,11,16)] px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="text-base font-semibold text-[rgb(254,254,254)]">
                  {brand.founder}
                </span>
                <Check size={14} className="text-[rgb(124,92,252)]" />
              </div>
              <div className="text-sm text-[rgb(254,254,254)]">{footer.founderCaption}</div>
            </div>
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
              ["Instagram", brand.instagram],
              ["Facebook", brand.facebook],
              ["LinkedIn", brand.linkedin],
              [brand.email, `mailto:${brand.email}`],
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-4 border-t border-[rgb(254,254,254)]/40 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-[rgb(254,254,254)]">
            &copy; {brand.year} {brand.name}
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
