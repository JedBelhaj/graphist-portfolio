import { ACCENT } from "@/lib/brand";

/* A browser window drawn in CSS around a screenshot, so web work reads as a
   website at a glance rather than as one more photo. Size it from outside;
   the screenshot fills whatever height the frame is given.

   `wireframe` lays a sketch of a landing page (nav, headline, button) over
   the image. It is there because the current images are MOCK photos, which
   on their own just look like a photo in a window. Turn it off once real
   site screenshots are dropped in. */
export default function BrowserFrame({
  src,
  url = "yourbrand.com",
  alt = "",
  wireframe = true,
  className = "",
}: {
  src: string;
  url?: string;
  alt?: string;
  wireframe?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_30px_70px_rgba(0,0,0,0.35)] ring-1 ring-black/10 ${className}`}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-black/6 bg-[rgb(246,246,248)] px-3 py-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(255,95,87)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(254,188,46)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(40,200,64)]" />
        </div>
        <div className="mx-auto w-full max-w-[60%] truncate rounded-md bg-white px-3 py-0.5 text-center text-[11px] text-[rgb(122,122,132)] ring-1 ring-black/5">
          {url}
        </div>
        {/* Balances the dots so the address bar sits dead centre. */}
        <div className="w-[42px]" aria-hidden="true" />
      </div>
      <div className="relative min-h-0 flex-1">
        <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
        {wireframe && (
          <div
            className="absolute inset-0 flex flex-col bg-gradient-to-r from-black/70 via-black/35 to-transparent p-[6%]"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between">
              <span className="h-[6px] w-[14%] rounded-full bg-white" />
              <div className="flex items-center gap-2.5 [&>span]:h-[4px] [&>span]:w-[22px] [&>span]:rounded-full [&>span]:bg-white/70">
                <span />
                <span />
                <span />
                <div className="h-[12px] w-[38px] rounded-full" style={{ backgroundColor: ACCENT }} />
              </div>
            </div>
            <div className="mt-auto flex w-[62%] flex-col gap-[6px]">
              <span className="h-[10px] w-full rounded-full bg-white" />
              <span className="h-[10px] w-[72%] rounded-full bg-white" />
              <span className="mt-1 h-[5px] w-[85%] rounded-full bg-white/60" />
              <span className="h-[5px] w-[60%] rounded-full bg-white/60" />
              <span className="mt-2 h-[16px] w-[42%] rounded-full" style={{ backgroundColor: ACCENT }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
