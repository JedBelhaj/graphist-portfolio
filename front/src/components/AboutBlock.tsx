import type { ReactNode } from "react";

export default function AboutBlock({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="text-base text-[rgb(254,254,254)]">{num}</div>
      <div className="flex flex-col gap-6">
        <div className="text-base font-bold text-[rgb(254,254,254)]">{title}</div>
        <p className="text-base leading-relaxed text-[rgb(254,254,254)]">{children}</p>
      </div>
    </div>
  );
}
