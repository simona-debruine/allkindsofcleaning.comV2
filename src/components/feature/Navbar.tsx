import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop();
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#contact");
    }
  };

  const handleBookNow = (e: React.MouseEvent) => {
    if (location.pathname === "/schedule") {
      e.preventDefault();
      scrollToTop();
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Schedule", href: "/schedule" },
    { label: "Contact", onClick: handleContactClick, isContact: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-background-50/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, "/")}
            className={`flex items-center gap-2 font-heading font-bold text-lg md:text-xl tracking-tight transition-colors ${
              scrolled || !isHome ? "text-foreground-950" : "text-white"
            }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500 text-white">
              <i className="ri-sparkling-line text-base" />
            </span>
            <span className="whitespace-nowrap">All Kinds of Cleaning</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isContact ? (
                <a
                  key={link.label}
                  href="#contact"
                  onClick={link.onClick}
                  className={`text-sm font-medium transition-colors hover:text-primary-500 cursor-pointer ${
                    scrolled || !isHome
                      ? "text-foreground-700"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href!}
                  onClick={(e) => handleNavClick(e, link.href!)}
                  className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                    scrolled || !isHome
                      ? "text-foreground-700"
                      : "text-white/80 hover:text-white"
                  } ${location.pathname === link.href ? "text-primary-500" : ""}`}
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              to="/schedule"
              onClick={handleBookNow}
              className="px-5 py-2.5 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              scrolled || !isHome ? "text-foreground-950" : "text-white"
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
            {navLinks.map((link) =>
              link.isContact ? (
                <a
                  key={link.label}
                  href="#contact"
                  onClick={link.onClick}
                  className="text-sm font-medium text-foreground-700 hover:text-primary-500 py-2 transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href!}
                  onClick={(e) => handleNavClick(e, link.href!)}
                  className="text-sm font-medium text-foreground-700 hover:text-primary-500 py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              to="/schedule"
              onClick={handleBookNow}
              className="mt-2 px-5 py-2.5 rounded-md bg-primary-500 text-white text-sm font-medium text-center hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}