"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Facebook, Instagram, Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { NAV } from "@/lib/content";
import Logo from "./Logo";

/* Shared curve for every part of the shrink, so the bar, its padding and the
   logo all settle together instead of arriving one after another. */
const EASE = "duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

const SOCIALS = [
  { label: "Instagram", href: BRAND.instagram, Icon: Instagram },
  { label: "Facebook", href: BRAND.facebook, Icon: Facebook },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Flush with the very top, the bar spans the full content width with no
     backing. Any scroll at all and it pulls in to a narrower floating pill. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The header lives in the layout, so it survives navigation — anything left
     open would still be open on the next page. */
  useEffect(() => {
    setMenuOpen(false);
    setWorkOpen(false);
    setMobileWorkOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const linkCls = (active: boolean) =>
    `rounded-full px-3 py-2 text-[15px] font-semibold transition-colors hover:text-[rgb(124,92,252)] ${
      active ? "text-[rgb(124,92,252)]" : "text-[rgb(10,11,16)]"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] transition-[padding] ${EASE} ${
        scrolled ? "px-3 pt-3 sm:px-5" : "px-0 pt-0"
      }`}
    >
      {/* rounded-[40px] rather than rounded-full: Tailwind's full radius is
          effectively infinite, which can't be interpolated, so the corners
          would snap instead of easing in with the width. */}
      <div
        className={`mx-auto flex items-center justify-between gap-4 transition-[max-width,padding,border-radius,background-color,box-shadow] ${EASE} ${
          scrolled
            ? "max-w-[1040px] rounded-[40px] bg-white/85 px-4 py-2 shadow-[0_10px_30px_rgba(10,11,16,0.10)] backdrop-blur-md sm:px-6"
            : "max-w-[1300px] rounded-[0px] bg-transparent px-5 py-4 shadow-none sm:px-8 lg:px-[80px] lg:py-6"
        }`}
      >
        <Link
          href="/"
          aria-label={`${BRAND.name} home`}
          className={`block shrink-0 origin-left transition-transform ${EASE} ${scrolled ? "scale-[0.85]" : ""}`}
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) =>
            n.children ? (
              <div
                key={n.label}
                ref={dropdownRef}
                className="relative"
                onMouseEnter={() => setWorkOpen(true)}
                onMouseLeave={() => setWorkOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setWorkOpen(false)}
                onBlur={(e) => {
                  if (!dropdownRef.current?.contains(e.relatedTarget as Node)) setWorkOpen(false);
                }}
              >
                <div className="flex items-center">
                  <Link href={n.href} className={linkCls(isActive(n.href))}>
                    {n.label}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Show ${n.label} pages`}
                    aria-expanded={workOpen}
                    aria-haspopup="true"
                    onClick={() => setWorkOpen((v) => !v)}
                    className="-ml-2 rounded-full p-1 text-[rgb(10,11,16)] transition-colors hover:text-[rgb(124,92,252)]"
                  >
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-300 ${workOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* pt-3 rather than a margin: the gap stays part of the hover
                    area, so moving down to the menu doesn't close it. */}
                <div
                  className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-[opacity,translate,visibility] duration-200 ${
                    workOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                  }`}
                >
                  <div className="min-w-[210px] rounded-2xl border border-black/5 bg-white p-2 shadow-[0_14px_40px_rgba(10,11,16,0.12)]">
                    {n.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-colors hover:bg-[rgb(238,234,255)] ${
                          isActive(c.href) ? "text-[rgb(124,92,252)]" : "text-[rgb(10,11,16)]"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={n.label} href={n.href} className={linkCls(isActive(n.href))}>
                {n.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-[rgb(10,11,16)] transition-colors hover:bg-[rgb(238,234,255)] hover:text-[rgb(124,92,252)] sm:flex"
            >
              <Icon size={18} />
            </a>
          ))}
          <a
            href="#contact"
            className="ml-1 hidden rounded-full bg-[rgb(10,11,16)] px-5 py-2.5 text-base font-medium text-white transition-transform hover:scale-[1.03] sm:inline-block"
          >
            Work with us
          </a>
          <button
            type="button"
            className="ml-1 p-1 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu: a floating card under the bar in either state, so it
          doesn't have to morph between full-width and pill with the bar. */}
      {menuOpen && (
        <div className={`lg:hidden ${scrolled ? "" : "px-3"}`}>
          <nav
            className="mx-auto mt-2 flex max-w-[1040px] flex-col rounded-2xl bg-white px-5 pb-5 pt-2 shadow-[0_14px_40px_rgba(10,11,16,0.12)]"
            aria-label="Mobile"
          >
            {NAV.map((n) => (
              <div key={n.label} className="border-b border-black/5">
                <div className="flex items-center justify-between">
                  <Link
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex-1 py-3 text-lg font-semibold transition-colors hover:text-[rgb(124,92,252)] ${
                      isActive(n.href) ? "text-[rgb(124,92,252)]" : "text-[rgb(10,11,16)]"
                    }`}
                  >
                    {n.label}
                  </Link>
                  {n.children && (
                    <button
                      type="button"
                      aria-label={`Show ${n.label} pages`}
                      aria-expanded={mobileWorkOpen}
                      onClick={() => setMobileWorkOpen((v) => !v)}
                      className="p-2"
                    >
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-300 ${mobileWorkOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {n.children && mobileWorkOpen && (
                  <div className="mb-3 flex flex-col border-l-2 border-[rgb(214,205,255)] pl-4">
                    {n.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMenuOpen(false)}
                        className={`py-2 text-base font-semibold ${
                          isActive(c.href) ? "text-[rgb(124,92,252)]" : "text-[rgb(74,74,86)]"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 flex items-center gap-3">
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-full bg-[rgb(10,11,16)] px-5 py-3 text-center text-base font-medium text-white"
              >
                Work with us
              </a>
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[rgb(10,11,16)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
