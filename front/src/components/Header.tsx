"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LOGO, NAV } from "@/lib/content";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-[1000] w-full">
      <div className="mx-auto flex max-w-[1300px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-[80px] lg:py-6">
        <div className="flex items-center gap-7">
          <a href="#top" className="block max-w-[110px] shrink-0 lg:max-w-[131px]">
            <img src={LOGO} alt="Eclectic Creative & Co." className="w-full" />
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="px-5 py-2 text-base font-semibold text-[rgb(10,11,16)] transition-colors hover:text-[rgb(167,68,255)]"
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
            Drop Me A Line
          </a>
          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-black/5 bg-white px-5 pb-6 pt-2 md:hidden">
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
              Drop Me A Line
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
