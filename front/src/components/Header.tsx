"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/content";
import Logo from "./Logo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* The bar is pinned on screen at all times, so the only thing scroll decides
     is whether it needs its solid backing to stay legible over content. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-[1000] w-full transition-colors duration-300 ease-out ${
        scrolled ? "bg-white/90 shadow-sm backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-[80px] lg:py-6">
        <div className="flex items-center gap-7">
          <a href="#top" className="block shrink-0">
            <Logo />
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="px-4 py-2 text-[15px] font-semibold text-[rgb(10,11,16)] transition-colors hover:text-[rgb(167,68,255)]"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden rounded-full bg-[rgb(10,11,16)] px-5 py-2.5 text-base font-medium text-white transition-transform hover:scale-[1.03] sm:inline-block"
          >
            Start A Project
          </a>
          <button
            className="lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-black/5 bg-white px-5 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-black/5 py-3 text-lg font-semibold transition-colors hover:text-[rgb(167,68,255)] text-[rgb(10,11,16)]"
              >
                {n.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-full bg-[rgb(10,11,16)] px-5 py-3 text-center text-base font-medium text-white"
            >
              Start A Project
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
