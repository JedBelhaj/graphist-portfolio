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
        {links.map(([label, href]) => (
          <a key={label} href={href} className="text-[rgb(254,254,254)] transition-opacity hover:opacity-60">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
