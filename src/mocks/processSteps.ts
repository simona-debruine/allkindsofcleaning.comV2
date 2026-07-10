export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
}

export const processSteps: ProcessStep[] = [
  {
    id: "step1",
    number: "01",
    title: "Book Your Clean",
    description: "Schedule online or give us a call. Choose your service, pick a convenient time, and receive instant confirmation. Flexible scheduling that works around your life.",
    icon: "ri-calendar-check-line",
  },
  {
    id: "step2",
    number: "02",
    title: "We Do the Work",
    description: "Our trained professionals arrive fully equipped with eco-friendly products. Every surface, corner, and detail receives meticulous attention according to your custom cleaning plan.",
    icon: "ri-sparkling-line",
  },
  {
    id: "step3",
    number: "03",
    title: "Enjoy the Results",
    description: "Step into a fresh, revitalized space that looks, smells, and feels incredible. If anything is not perfect, we will make it right with our satisfaction guarantee.",
    icon: "ri-brush-line",
  },
];