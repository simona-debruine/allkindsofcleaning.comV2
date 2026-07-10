export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Services",
      links: [
        { label: "Residential Cleaning", href: "#services" },
        { label: "Airbnb / Vacation Rentals", href: "#services" },
        { label: "Commercial Cleaning", href: "#services" },
        { label: "Move In / Move Out", href: "#services" },
        { label: "Post-Construction", href: "#services" },
        { label: "Window Cleaning", href: "#services" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Our Process", href: "#process" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "Contact", href: "#contact" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-background-100 border-t border-background-200/70">
      <div className="w-full px-6 lg:px-10 max-w-7xl mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 font-heading font-bold text-lg text-foreground-950 mb-4">
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500 text-white">
                <i className="ri-sparkling-line text-base" />
              </span>
              <span className="whitespace-nowrap">All Kinds of Cleaning</span>
            </a>
            <p className="text-foreground-600 text-sm leading-relaxed max-w-md mb-6">
              Professional residential and commercial cleaning services you can trust.
              Eco-friendly products, trained staff, and a 100% satisfaction guarantee
              on every job we complete.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-background-200/70 text-foreground-600 hover:bg-primary-500 hover:text-white transition-colors"
                aria-label="Facebook"
                rel="nofollow"
              >
                <i className="ri-facebook-fill" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-background-200/70 text-foreground-600 hover:bg-primary-500 hover:text-white transition-colors"
                aria-label="Instagram"
                rel="nofollow"
              >
                <i className="ri-instagram-line" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-background-200/70 text-foreground-600 hover:bg-primary-500 hover:text-white transition-colors"
                aria-label="Twitter"
                rel="nofollow"
              >
                <i className="ri-twitter-x-line" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-sm text-foreground-950 uppercase tracking-wide mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-foreground-600 text-sm hover:text-primary-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-background-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-foreground-500 text-xs md:text-sm">
            &copy; {currentYear} All Kinds of Cleaning. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-foreground-500 text-xs md:text-sm hover:text-foreground-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground-500 text-xs md:text-sm hover:text-foreground-700 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}