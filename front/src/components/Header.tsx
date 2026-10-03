"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Facebook, Instagram, Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { NAV } from "@/lib/content";
import Button from "./Button";
import Logo from "./Logo";
import PlayMark from "./PlayMark";

const SOCIALS = [
  { label: "Instagram", href: BRAND.instagram, Icon: Instagram },
  { label: "Facebook", href: BRAND.facebook, Icon: Facebook },
];

/* A solid ink bar on every page — the top half of a letterbox. Scrolling
   only tightens it and draws a hairline under it; it never changes colour,
   so the white logo and links read the same over every section. */
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  /* Active page gets the red play mark in front of it rather than a colour
     change, so it still reads at a glance on the dark bar. */
  const linkCls = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors hover:text-white ${
      active ? "text-white" : "text-white/60"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[1000] bg-ink transition-[box-shadow] duration-300 ${
        scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.08)]" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1300px] items-center justify-between gap-4 px-5 transition-[padding] duration-300 sm:px-8 lg:px-10 ${
          scrolled ? "py-3" : "py-4 lg:py-5"
        }`}
      >
        <Link href="/" aria-label={`${BRAND.name} home`} className="block shrink-0">
          <Logo tone="light" className="h-[17px] sm:h-[19px] lg:h-[21px]" />
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Main">
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
                    {isActive(n.href) && <PlayMark className="text-[9px] text-brand" />}
                    {n.label}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Show ${n.label} pages`}
                    aria-expanded={workOpen}
                    aria-haspopup="true"
                    onClick={() => setWorkOpen((v) => !v)}
                    className="-ml-2 p-1 text-white/60 transition-colors hover:text-white"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${workOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* pt-3 rather than a margin: the gap stays part of the hover
                    area, so moving down to the menu doesn't close it. */}
                <div
                  className={`absolute left-0 top-full pt-3 transition-[opacity,translate,visibility] duration-200 ${
                    workOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                  }`}
                >
                  <div className="min-w-[220px] border border-white/10 bg-ink-2 p-1.5">
                    {n.children.map((c, i) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`flex items-center justify-between gap-6 px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-white/5 hover:text-white ${
                          isActive(c.href) ? "text-white" : "text-white/65"
                        }`}
                      >
                        {c.label}
                        <span className="readout text-white/35">0{i + 1}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link key={n.label} href={n.href} className={linkCls(isActive(n.href))}>
                {isActive(n.href) && <PlayMark className="text-[9px] text-brand" />}
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
              className="hidden h-9 w-9 items-center justify-center text-white/60 transition-colors hover:text-white sm:flex"
            >
              <Icon size={17} />
            </a>
          ))}
          {/* Hidden on the wrapper, not the button: the button sets its own
              display, which would win over a `hidden` passed into it. */}
          <span className="ml-2 hidden sm:block">
            <Button href="#contact" variant="brand" className="!px-5 !py-2.5">
              Start a project
            </Button>
          </span>
          <button
            type="button"
            className="ml-1 p-1 text-white lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu: drops down as part of the bar, full width. */}
      {menuOpen && (
        <nav className="border-t border-white/10 bg-ink px-5 pb-6 pt-2 sm:px-8 lg:hidden" aria-label="Mobile">
          {NAV.map((n, i) => (
            <div key={n.label} className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <Link
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className={`display flex flex-1 items-baseline gap-3 py-4 text-2xl ${
                    isActive(n.href) ? "text-white" : "text-white/70"
                  }`}
                >
                  <span className="readout text-brand">0{i + 1}</span>
                  {n.label}
                </Link>
                {n.children && (
                  <button
                    type="button"
                    aria-label={`Show ${n.label} pages`}
                    aria-expanded={mobileWorkOpen}
                    onClick={() => setMobileWorkOpen((v) => !v)}
                    className="p-2 text-white"
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${mobileWorkOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>
              {n.children && mobileWorkOpen && (
                <div className="mb-4 flex flex-col border-l border-brand pl-4">
                  {n.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setMenuOpen(false)}
                      className={`py-2 text-sm font-semibold uppercase tracking-[0.08em] ${
                        isActive(c.href) ? "text-white" : "text-white/60"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-6 flex items-center gap-3">
            <Button href="#contact" variant="brand" className="flex-1" onClick={() => setMenuOpen(false)}>
              Start a project
            </Button>
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center border border-white/20 text-white"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
