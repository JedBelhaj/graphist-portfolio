import Link from "next/link";

const CLS = "text-white/70 transition-colors hover:text-white";

export default function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="readout text-white/40">{title}</div>
      <div className="flex flex-col gap-3">
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
