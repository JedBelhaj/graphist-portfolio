import Link from "next/link";

const CLS = "text-[rgb(254,254,254)] transition-opacity hover:opacity-60";

export default function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="text-base font-semibold text-[rgb(254,254,254)]">{title}</div>
      <div className="flex flex-col gap-5">
        {/* Site routes go through Link for client-side navigation; socials and
            mailto stay plain anchors. */}
        {links.map(([label, href]) =>
          href.startsWith("/") ? (
            <Link key={label} href={href} className={CLS}>
              {label}
            </Link>
          ) : (
            <a key={label} href={href} className={CLS}>
              {label}
            </a>
          ),
        )}
      </div>
    </div>
  );
}
