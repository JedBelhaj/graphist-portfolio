import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FONT_DISPLAY } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What this site collects (very little) and who to contact about it.",
};

/* Plain privacy notice, kept in code rather than the studio: it describes how
   the site itself is built (no forms, no analytics, self-hosted fonts), so it
   only changes when the code does. Update it if a form, analytics or a new
   embed is added. */
const UPDATED = "1 November 2026";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-black/10 py-8">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight lg:text-3xl" style={{ fontFamily: FONT_DISPLAY }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-[rgb(51,51,60)] lg:text-lg">{children}</div>
    </section>
  );
}

export default async function PrivacyPage() {
  const { brand } = await getContent();
  const mail = (
    <a href={`mailto:${brand.email}`} className="font-semibold underline">
      {brand.email}
    </a>
  );

  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy">
        Short version: this site doesn&apos;t track you, sets no cookies of its own, and has no forms.
      </PageHero>

      <div className="bg-white px-5 pb-24 sm:px-8">
        {/* Same left edge as the hero above, with a readable line length. */}
        <div className="mx-auto max-w-[1180px] [&>*]:max-w-[760px]">
          <Block title="Who we are">
            <p>
              This site belongs to {brand.name}. For anything about your data, write to {mail}.
            </p>
          </Block>

          <Block title="What we collect">
            <p>
              Nothing through the site itself. There are no contact forms, no newsletter sign-up, no analytics and no
              advertising trackers, and the site sets no cookies of its own.
            </p>
            <p>
              If you email us, we receive your email address and whatever you write, and use them only to reply and to
              work with you. We don&apos;t sell or share them, and we delete them on request.
            </p>
          </Block>

          <Block title="Services the site relies on">
            <p>
              <strong>Hosting.</strong> The site runs on Vercel, which, like any web host, briefly keeps technical logs
              (such as IP addresses) to deliver pages and keep the service secure.
            </p>
            <p>
              <strong>Images and videos.</strong> Photos and video clips are served from Sanity&apos;s content network.
              No account or cookie is involved.
            </p>
            <p>
              <strong>Embedded films.</strong> Some films play in a YouTube or Vimeo player. YouTube is embedded in its
              privacy-enhanced mode, and neither loads until you press play; once a film plays, that service&apos;s
              own privacy policy applies.
            </p>
            <p>
              <strong>Social links.</strong> Links to Instagram, Facebook and LinkedIn take you to those sites, which
              have their own policies.
            </p>
          </Block>

          <Block title="Your rights">
            <p>
              You can ask what we hold about you, have it corrected or deleted, or object to how it&apos;s used, by
              writing to {mail}. If you&apos;re in the EU or UK, you can also complain to your local data protection
              authority.
            </p>
          </Block>

          <p className="border-t border-black/10 pt-8 text-sm text-[rgb(122,122,132)]">Last updated {UPDATED}.</p>
        </div>
      </div>
    </>
  );
}
