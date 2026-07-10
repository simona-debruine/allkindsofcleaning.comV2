import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Process", href: "#process" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background-50/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            className={`flex items-center gap-2 font-heading font-bold text-lg md:text-xl tracking-tight transition-colors ${
              scrolled ? "text-foreground-950" : "text-white"
            }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500 text-white">
              <i className="ri-sparkling-line text-base" />
            </span>
            <span className="whitespace-nowrap">All Kinds of Cleaning</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                  scrolled ? "text-foreground-700" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Get a Quote
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              scrolled ? "text-foreground-950" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            <i className={`ri-${mobileOpen ? "close" : "menu"}-line text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background-50/98 backdrop-blur-md border-t border-background-200/70 px-6 py-4 shadow-lg">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-foreground-700 hover:text-primary-500 py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-5 py-2.5 rounded-md bg-primary-500 text-white text-sm font-medium text-center hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Get a Quote
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}