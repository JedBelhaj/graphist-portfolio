import type { Metadata } from "next";
import { Facebook, Instagram, Mail } from "lucide-react";
import { ACCENT_WASH, FONT_DISPLAY } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import { CONTACT_PAGE } from "@/lib/content";
import ContactForm from "@/components/ContactForm";
import Faq from "@/components/Faq";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell Soltani Media about your project: photography, videography or web design.",
};

/* The form on the right; on the left, the other ways to reach us, for
   people who'd rather write from their own inbox or DM. Stacked on phones,
   form first. */
export default async function ContactPage() {
  const { brand } = await getContent();
  const links = [
    { label: brand.email, href: `mailto:${brand.email}`, Icon: Mail },
    { label: "Instagram", href: brand.instagram, Icon: Instagram },
    { label: "Facebook", href: brand.facebook, Icon: Facebook },
  ].filter((l) => l.href);

  return (
    <>
      <PageHero eyebrow={CONTACT_PAGE.eyebrow} title={CONTACT_PAGE.title} accent={CONTACT_PAGE.accent}>
        {CONTACT_PAGE.body}
      </PageHero>

      <section style={{ backgroundColor: ACCENT_WASH }} className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2
              className="text-2xl font-semibold tracking-tight text-[rgb(10,11,16)]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Prefer to write directly?
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {links.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex items-center gap-3 text-base font-medium text-[rgb(10,11,16)] transition-colors hover:text-[rgb(124,92,252)]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-[rgb(10,11,16)]/10">
                      <Icon size={18} />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <ContactForm email={brand.email} />
          </div>
        </div>
      </section>

      <Faq embedded />
    </>
  );
}
