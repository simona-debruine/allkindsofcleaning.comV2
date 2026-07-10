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

export const services: Service[] = [
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
        alt: "Clean modern kitchen after residential cleaning",
      },
      {
        url: `${__BASE_PATH__}residential/residential-kitchen-ocean.png`,
        alt: "Open kitchen and living area with ocean view after professional cleaning",
      },
      {
        url: `${__BASE_PATH__}residential/residential-bathroom-shower.png`,
        alt: "Clean bathroom with glass shower and light blue vanity",
      },
      {
        url: `${__BASE_PATH__}residential/residential-living-bunk-ocean.png`,
        alt: "Coastal living room with ocean view after cleaning",
      },
      {
        url: `${__BASE_PATH__}residential/residential-bathroom-double-vanity.png`,
        alt: "Spacious bathroom with double vanity and walk-in shower",
      },
      {
        url: `${__BASE_PATH__}residential/residential-bedroom-ocean.png`,
        alt: "Coastal bedroom with ocean view after professional cleaning",
      },
      {
        url: `${__BASE_PATH__}residential/residential-bathroom-teal.png`,
        alt: "Modern bathroom with teal tile accent wall",
      },
      {
        url: `${__BASE_PATH__}residential/residential-lounge-bar.png`,
        alt: "Bright living room with wet bar and white brick fireplace",
      },
    ],
    price: "$110-200",
    priceNote: "Standard Clean price. All tiers: $90-225",
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
        url: "https://readdy.ai/api/search-image?query=Beautiful%20vacation%20rental%20interior%2C%20cozy%20beach%20house%20bedroom%20with%20white%20linens%2C%20tropical%20plants%2C%20natural%20light%2C%20fresh%20and%20inviting%20atmosphere%2C%20professionally%20cleaned%20space%2C%20warm%20neutral%20tones%2C%20editorial%20interior%20photography&width=800&height=500&seq=airbnb-1&orientation=landscape",
        alt: "Vacation rental bedroom professionally prepared",
      },
      {
        url: "https://readdy.ai/api/search-image?query=Stylish%20Airbnb%20rental%20living%20area%20with%20modern%20furniture%2C%20clean%20and%20welcoming%20interior%2C%20warm%20ambient%20lighting%2C%20potted%20plants%2C%20spotless%20hardwood%20floors%2C%20vacation%20home%20atmosphere%2C%20editorial%20photography&width=800&height=500&seq=airbnb-2&orientation=landscape",
        alt: "Airbnb rental living space after turnover cleaning",
      },
    ],
    price: "$125-210",
    priceNote: "Standard Clean price. All tiers: $100-280",
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
    price: "$100-175",
    priceNote: "Standard Clean price. All tiers: $85-230",
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
    price: "$150-275",
    priceNote: "Standard Clean price. All tiers: $50-275",
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
    price: "$250-450",
    priceNote: "Starting price based on scope",
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
    price: "$5",
    priceNote: "Per window",
    icon: "ri-sun-line",
  },
];