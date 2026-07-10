export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
  color: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Mitchell",
    role: "Homeowner",
    content: "All Kinds of Cleaning transformed my home. I have never seen my kitchen counters sparkle like this. Their team is professional, punctual, and genuinely cares about doing an excellent job.",
    rating: 5,
    initials: "SM",
    color: "bg-primary-100 text-primary-700",
  },
  {
    id: "t2",
    name: "James Rodriguez",
    role: "Office Manager",
    content: "We switched to All Kinds of Cleaning for our office, and the difference is night and day. Our employees have commented on how fresh the workspace feels. Highly recommend their commercial services.",
    rating: 5,
    initials: "JR",
    color: "bg-accent-100 text-accent-700",
  },
  {
    id: "t3",
    name: "Emily Chen",
    role: "Real Estate Agent",
    content: "I hire All Kinds of Cleaning for every listing that needs staging prep. Their move-out cleaning service is impeccable, and properties always show better after their team has been through.",
    rating: 5,
    initials: "EC",
    color: "bg-secondary-100 text-secondary-700",
  },
  {
    id: "t4",
    name: "David Thompson",
    role: "Restaurant Owner",
    content: "Finding a reliable cleaning crew for our restaurant was tough until we found All Kinds of Cleaning. They understand the standards we need and always deliver. A true partner in our business.",
    rating: 5,
    initials: "DT",
    color: "bg-primary-100 text-primary-700",
  },
];