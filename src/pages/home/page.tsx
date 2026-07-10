import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RaindropHero from "./components/RaindropHero";
import ServicesSection from "./components/ServicesSection";
import WhyChooseUs from "./components/WhyChooseUs";
import ProcessSection from "./components/ProcessSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactCTA from "./components/ContactCTA";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contact") {
      const scrollToContact = () => {
        const el = document.getElementById("contact");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };
      // Small delay to let the page finish rendering
      const timer = setTimeout(scrollToContact, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <main className="bg-background-50 text-foreground-950">
      <RaindropHero />
      <ServicesSection />
      <WhyChooseUs />
      <ProcessSection />
      <TestimonialsSection />
      <ContactCTA />
    </main>
  );
}