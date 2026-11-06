import { getServiceHeadlinePrice, getServicePriceNote } from "@/lib/cie/displayPricing";

/** Florida property photos kept as past work. Folder names stay so the files still load. */
export function isPastWorkPhoto(url: string): boolean {
  return /sanibel|captiva/i.test(url);
}

export interface ServiceFeature {
  text: string;
}

export interface ServiceImage {
  url: string;
  alt: string;
}

export interface Service {
  id: string;
  title: string;
  tag: string;
  description: string;
  features: ServiceFeature[];
  images: ServiceImage[];
  price: string;
  priceNote: string;
  icon: string;
  popular?: boolean;
}

const rawServices: Omit<Service, "price" | "priceNote">[] = [
  {
    id: "residential",
    title: "Residential Home Cleaning",
    tag: "Residential",
    description: "Comprehensive cleaning for your home — kitchens, bathrooms, living spaces, and bedrooms. We handle dusting, vacuuming, mopping, sanitizing, and more.",
    features: [
      { text: "Kitchen & Appliance Cleaning" },
      { text: "Bathroom Scrub & Sanitize" },
      { text: "Bedroom & Living Area Care" },
      { text: "Window & Baseboard Cleaning" },
    ],
    images: [
      {
        url: "https://readdy.ai/api/search-image?query=Pristine%20modern%20kitchen%20with%20white%20countertops%20and%20stainless%20steel%20appliances%2C%20professional%20cleaning%20result%2C%20spotless%20surfaces%2C%20warm%20natural%20lighting%2C%20clean%20minimalist%20interior%20design%2C%20editorial%20photography&width=800&height=500&seq=residential-2&orientation=landscape",
        alt: "Clean modern kitchen sink after residential cleaning",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/Bathroom-1.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/bathroom-2.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/bathroom-3.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/Bedroom-2.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/dining-2.webp`,
        alt: "Past work: dining",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/guest-bedroom-3.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/hallway-1.webp`,
        alt: "Past work: hallway",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/hallway.webp`,
        alt: "Past work: hallway",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/Kitchen-2.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/living-room-5.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-1/sitting-area.webp`,
        alt: "Past work: sitting area",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/Bathroom.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/Bedroom.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/dining-1.webp`,
        alt: "Past work: dining",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/guest-bath.webp`,
        alt: "Past work: guest bath",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/guest-bedroom-2.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/laundry.webp`,
        alt: "Past work: laundry",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/Living-room.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-2/Private-Kitchen.webp`,
        alt: "Past work: private kitchen",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/Bedroom-1.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/bedroom-3.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/bedroom-4.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/bedroom-8.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/guest-bedroom.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/Kitchen-1.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/kitchen.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/living-area-2.webp`,
        alt: "Past work: living area",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/Living-room-1.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/Living-room-2.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/master-bath-1.webp`,
        alt: "Past work: master bath",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/master-bath.webp`,
        alt: "Past work: master bath",
      },
      {
        url: `${__BASE_PATH__}residential/Captiva-property-3/master-bedroom-1.webp`,
        alt: "Past work: master bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/bathroom.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/den.webp`,
        alt: "Past work: den",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/guest-bedroom-1.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/kitchen-3.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/living-area-1.webp`,
        alt: "Past work: living area",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/living-room-3.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/master-bathroom.webp`,
        alt: "Past work: master bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-1/master-bedroom.webp`,
        alt: "Past work: master bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/bathroom-4.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/bedroom-5.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/bedroom-6.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/bedroom.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/dining-room.webp`,
        alt: "Past work: dining room",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/dining.webp`,
        alt: "Past work: dining",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/dinnerware.webp`,
        alt: "Past work: dinnerware",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/living-area.webp`,
        alt: "Past work: living area",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/living-room-4.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-2/upstairs.webp`,
        alt: "Past work: upstairs",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/bar.webp`,
        alt: "Past work: bar",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/bathroom-5.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/bathroom-6.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/bedroom-7.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/den-1.webp`,
        alt: "Past work: den",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/Kitchen-counter-gleam.webp`,
        alt: "Past work: kitchen counter gleam",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-3/living-room.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_10.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_11.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_2.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_3.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_4.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_5.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_6.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_7.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_8.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}residential/Sanibel-property-4/photo_9.jpg`,
        alt: "Past work: home interior",
      },
    ],
    icon: "ri-home-smile-line",
    popular: true,
  },
  {
    id: "airbnb",
    title: "Airbnb / Vacation Rental Turnover",
    tag: "Airbnb/Vacation Rental",
    description: "Rapid, hotel-quality turnovers between guests. We prepare your property for 5-star reviews with meticulous attention to detail and fast turnaround times.",
    features: [
      { text: "Express Turnaround Service" },
      { text: "Linen & Towel Refresh" },
      { text: "Kitchen Restocking Prep" },
      { text: "Inspection-Ready Standards" },
    ],
    images: [
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/Bathroom-1.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/bathroom-2.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/bathroom-3.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/Bedroom-2.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/dining-2.webp`,
        alt: "Past work: dining",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/guest-bedroom-3.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/hallway-1.webp`,
        alt: "Past work: hallway",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/hallway.webp`,
        alt: "Past work: hallway",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/Kitchen-2.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/living-room-5.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-1/sitting-area.webp`,
        alt: "Past work: sitting area",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/Bathroom.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/Bedroom.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/dining-1.webp`,
        alt: "Past work: dining",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/dining-area.webp`,
        alt: "Past work: dining area",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/dining-room-1.webp`,
        alt: "Past work: dining room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/guest-bath.webp`,
        alt: "Past work: guest bath",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/guest-bedroom-2.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/laundry.webp`,
        alt: "Past work: laundry",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/Living-room.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-2/Private-Kitchen.webp`,
        alt: "Past work: private kitchen",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/Bedroom-1.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/bedroom-3.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/bedroom-4.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/bedroom-8.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/guest-bedroom.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/Kitchen-1.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/kitchen.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/living-area-2.webp`,
        alt: "Past work: living area",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/Living-room-1.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/Living-room-2.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/master-bath-1.webp`,
        alt: "Past work: master bath",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/master-bath.webp`,
        alt: "Past work: master bath",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Captiva-property-3/master-bedroom-1.webp`,
        alt: "Past work: master bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/bathroom.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/den.webp`,
        alt: "Past work: den",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/guest-bedroom-1.webp`,
        alt: "Past work: guest bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/kitchen-3.webp`,
        alt: "Past work: kitchen",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/living-area-1.webp`,
        alt: "Past work: living area",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/living-room-3.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/master-bathroom.webp`,
        alt: "Past work: master bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/master-bedroom.webp`,
        alt: "Past work: master bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-1/office.webp`,
        alt: "Past work: office",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/bathroom-4.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/bedroom-5.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/bedroom-6.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/bedroom.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/dining-room.webp`,
        alt: "Past work: dining room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/dining.webp`,
        alt: "Past work: dining",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/dinnerware.webp`,
        alt: "Past work: dinnerware",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/living-area.webp`,
        alt: "Past work: living area",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/living-room-4.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-2/upstairs.webp`,
        alt: "Past work: upstairs",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/bar.webp`,
        alt: "Past work: bar",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/bathroom-5.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/bathroom-6.webp`,
        alt: "Past work: bathroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/bedroom-7.webp`,
        alt: "Past work: bedroom",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/den-1.webp`,
        alt: "Past work: den",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/Kitchen-counter-gleam.webp`,
        alt: "Past work: kitchen counter gleam",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-3/living-room.webp`,
        alt: "Past work: living room",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_1.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_10.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_11.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_2.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_3.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_4.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_5.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_6.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_7.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_8.jpg`,
        alt: "Past work: home interior",
      },
      {
        url: `${__BASE_PATH__}vacation-rental/Sanibel-property-4/photo_9.jpg`,
        alt: "Past work: home interior",
      },
    ],
    icon: "ri-hotel-bed-line",
  },
  {
    id: "commercial",
    title: "Office Cleaning",
    tag: "Office",
    description: "Professional cleaning services for offices and workspaces. Keep your team's environment healthy, productive, and consistently spotless.",
    features: [
      { text: "Daily or Weekly Scheduling" },
      { text: "Desk & Workstation Cleaning" },
      { text: "Conference Room Care" },
      { text: "Restroom & Breakroom Sanitizing" },
    ],
    images: [
      {
        url: `${__BASE_PATH__}office-cleaning.png`,
        alt: "Bright home office and guest room with desk, daybed, and blue accent wall",
      },
      {
        url: "https://readdy.ai/api/search-image?query=Clean%20corporate%20conference%20room%20with%20polished%20table%20and%20chairs%2C%20floor-to-ceiling%20windows%2C%20bright%20professional%20interior%2C%20pristine%20workspace%20environment%2C%20modern%20office%20design%2C%20natural%20daylight%2C%20editorial%20photography&width=800&height=500&seq=commercial-2&orientation=landscape",
        alt: "Corporate conference room professionally cleaned",
      },
    ],
    icon: "ri-building-line",
  },
  {
    id: "move-in-out",
    title: "Move In / Move Out Cleaning",
    tag: "Move In/Out",
    description: "Specialized deep cleaning for empty homes. Whether you're moving in or moving out, we ensure the space is pristine and ready for its next chapter.",
    features: [
      { text: "Inside Cabinet & Drawer Cleaning" },
      { text: "Refrigerator & Oven Deep Clean" },
      { text: "Wall & Baseboard Detail" },
      { text: "Closet & Pantry Sanitizing" },
    ],
    images: [
      {
        url: "https://readdy.ai/api/search-image?query=Empty%20pristine%20apartment%20ready%20for%20move-in%2C%20clean%20hardwood%20floors%2C%20fresh%20white%20walls%2C%20sunlight%20streaming%20through%20large%20windows%2C%20spotless%20unfurnished%20living%20space%2C%20professional%20move-out%20cleaning%20result%2C%20editorial%20interior%20photography&width=800&height=500&seq=movein-1&orientation=landscape",
        alt: "Empty apartment after move-out cleaning",
      },
      {
        url: `${__BASE_PATH__}move-in-out-cleaning.png`,
        alt: "Empty sunlit room with moving boxes ready for move-in or move-out cleaning",
      },
    ],
    icon: "ri-truck-line",
  },
  {
    id: "post-construction",
    title: "Post-Construction Cleaning",
    tag: "Post-Construction",
    description: "Remove dust, debris, and construction residue after renovations. We transform your construction site into a clean, move-in ready space.",
    features: [
      { text: "Dust & Debris Removal" },
      { text: "Paint Splatter Cleanup" },
      { text: "Floor & Surface Detailing" },
      { text: "Final Polish & Inspection" },
    ],
    images: [
      {
        url: `${__BASE_PATH__}post-construction-1.png`,
        alt: "Worker vacuuming dust and debris from a construction site floor",
      },
      {
        url: `${__BASE_PATH__}post-construction-2.png`,
        alt: "Cleaning crew using industrial vacuum on rug after construction cleanup",
      },
    ],
    icon: "ri-hammer-line",
  },
  {
    id: "window-cleaning",
    title: "Window Cleaning",
    tag: "Window",
    description: "Crystal-clear windows inside and out. Our streak-free technique lets natural light flood in, enhancing the beauty of every room.",
    features: [
      { text: "Interior & Exterior Windows" },
      { text: "Screen & Track Cleaning" },
      { text: "Skylight & Glass Door Service" },
      { text: "Streak-Free Guarantee" },
    ],
    images: [
      {
        url: "https://readdy.ai/api/search-image?query=Professional%20window%20cleaning%20in%20progress%2C%20person%20with%20squeegee%20cleaning%20large%20glass%20window%2C%20bright%20sunlight%20streaming%20through%20crystal%20clear%20windows%2C%20modern%20home%20exterior%2C%20streak-free%20glass%2C%20warm%20natural%20lighting%2C%20editorial%20photography&width=800&height=500&seq=window-1&orientation=landscape",
        alt: "Professional window cleaning service",
      },
      {
        url: `${__BASE_PATH__}window-cleaning.png`,
        alt: "Professional cleaning windows with spray bottle and microfiber cloth",
      },
    ],
    icon: "ri-sun-line",
  },
  {
    id: "garden-care",
    title: "Garden Care",
    tag: "Outdoor",
    description:
      "Outdoor upkeep for the same households we clean. We weed beds, blow walks and patios, do light trimming, clear leaves, and tidy the porch and patio. This is garden care for your home, not mowing routes, planting installs, or chemical spraying.",
    features: [
      { text: "Weeding and bed cleanup" },
      { text: "Blowing walks, drives, and patios" },
      { text: "Light trimming and leaf cleanup" },
      { text: "Porch and patio tidy" },
    ],
    images: [
      {
        url: `${__BASE_PATH__}garden-care/beds.jpg`,
        alt: "Garden bed kept up for a household",
      },
      {
        url: `${__BASE_PATH__}garden-care/patio.jpg`,
        alt: "House porch ready for a light outdoor tidy",
      },
    ],
    icon: "ri-plant-line",
  },
];

export const services: Service[] = rawServices.map((service) => ({
  ...service,
  price: getServiceHeadlinePrice(service.id),
  priceNote: getServicePriceNote(service.id),
}));
