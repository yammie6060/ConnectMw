export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterLinkGroup = {
  heading: string;
  links: FooterLink[];
};

export type MarketingPageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  heroImage?: string;
  primaryCta?: FooterLink;
  secondaryCta?: FooterLink;
  highlights: {
    title: string;
    description: string;
  }[];
  sections: {
    title: string;
    body: string;
    points?: string[];
  }[];
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    heading: "Services",
    links: [
      { label: "HomeConnect", href: "/services/homeconnect" },
      { label: "BeautyConnect", href: "/services/beautyconnect" },
      { label: "SpareFinder", href: "/services/sparefinder" },
      { label: "List Your Business", href: "/list-your-business" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "MiNDTech Company", href: "https://mindtechs.vercel.app/", external: true },
      { label: "Careers", href: "/company/careers" },
      { label: "Press & Media", href: "/company/press-media" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms of Service", href: "/legal/terms-of-service" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
      { label: "Provider Agreement", href: "/legal/provider-agreement" },
    ],
  },
];

export const servicePages: Record<string, MarketingPageContent> = {
  homeconnect: {
    eyebrow: "HomeConnect",
    title: "Verified rentals, hostels, and homes across Malawi",
    subtitle: "A cleaner way to find a place without guesswork, hidden agents, or unsafe listings.",
    intro:
      "HomeConnect brings landlords, agents, students, and tenants into one trusted rental marketplace with transparent pricing, photos, and direct enquiries.",
    heroImage:
      "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1400&h=900&fit=crop&auto=format&q=85",
    primaryCta: { label: "Create an account", href: "/signup" },
    secondaryCta: { label: "List a property", href: "/list-your-business" },
    highlights: [
      { title: "Verified listings", description: "Properties are reviewed before they reach renters." },
      { title: "Student ready", description: "Hostels and shared housing can be found faster." },
      { title: "Direct enquiries", description: "Renters contact providers with clearer intent." },
    ],
    sections: [
      {
        title: "Built for renters",
        body:
          "Search by city, budget, property type, and proximity so renters can compare real options before calling.",
        points: ["Houses, apartments, rooms, and hostels", "Photo-led listing pages", "Transparent rent and location details"],
      },
      {
        title: "Built for providers",
        body:
          "Landlords and agents get a professional listing presence that makes each enquiry easier to qualify and manage.",
        points: ["Provider profiles", "Listing support", "Safer lead handling"],
      },
    ],
  },
  beautyconnect: {
    eyebrow: "BeautyConnect",
    title: "Book salons, barbers, nail techs, and beauty providers",
    subtitle: "BeautyConnect makes portfolios, availability, and bookings easier for customers and providers.",
    intro:
      "Customers can discover trusted local beauty professionals, compare work, and request appointments while providers keep their business organized.",
    heroImage:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1400&h=900&fit=crop&auto=format&q=85",
    primaryCta: { label: "Join as a customer", href: "/signup" },
    secondaryCta: { label: "List a beauty business", href: "/list-your-business" },
    highlights: [
      { title: "Portfolio first", description: "Customers can see real work before booking." },
      { title: "Booking flow", description: "Appointments are easier to request and confirm." },
      { title: "Local discovery", description: "Providers can be found by people nearby." },
    ],
    sections: [
      {
        title: "For customers",
        body:
          "Find beauty services by category, location, rating, and availability so your next appointment takes fewer calls.",
        points: ["Salons and barbers", "Makeup and nails", "At-home service options"],
      },
      {
        title: "For providers",
        body:
          "Build a simple digital storefront with services, pricing, portfolio images, and customer enquiries.",
        points: ["Service menus", "Booking requests", "Reviews and repeat clients"],
      },
    ],
  },
  sparefinder: {
    eyebrow: "SpareFinder",
    title: "Find the right auto spare from verified local dealers",
    subtitle: "SpareFinder helps drivers and workshops locate parts faster across trusted sellers.",
    intro:
      "Search for parts by vehicle type, part name, location, or image request, then connect with sellers who can confirm availability.",
    heroImage:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&h=900&fit=crop&auto=format&q=85",
    primaryCta: { label: "Search spares", href: "/signup" },
    secondaryCta: { label: "List spare parts", href: "/list-your-business" },
    highlights: [
      { title: "Part matching", description: "Customers can describe or show the part they need." },
      { title: "Nearest sellers", description: "Local availability is easier to compare." },
      { title: "Dealer profiles", description: "Sellers can build trust with clear inventory." },
    ],
    sections: [
      {
        title: "For drivers and workshops",
        body:
          "Reduce the time spent moving from shop to shop by checking availability and seller details first.",
        points: ["Minibus, pickup, saloon, and tractor parts", "Seller contact details", "Clear part requests"],
      },
      {
        title: "For spare dealers",
        body:
          "Reach buyers who already know what they need and keep your most requested parts visible online.",
        points: ["Inventory visibility", "Qualified enquiries", "Local delivery opportunities"],
      },
    ],
  },
};

export const standalonePages: Record<string, MarketingPageContent> = {
  "list-your-business": {
    eyebrow: "Provider onboarding",
    title: "List your business on ConnectMW",
    subtitle: "Bring your rental, beauty, or spare-parts business online with a trusted local platform.",
    intro:
      "ConnectMW gives Malawian providers a structured profile, customer enquiries, and a cleaner way to show services, listings, prices, and availability.",
    primaryCta: { label: "Create provider account", href: "/signup" },
    secondaryCta: { label: "Talk to us", href: "/contact" },
    highlights: [
      { title: "Professional presence", description: "Give customers a place to verify and understand your offer." },
      { title: "Better enquiries", description: "Receive more useful messages from people ready to act." },
      { title: "Local support", description: "Our team helps providers get listed clearly." },
    ],
    sections: [
      {
        title: "Who can list",
        body:
          "We support landlords, property agents, hostels, salons, barbers, independent beauty professionals, garages, and spare-parts dealers.",
        points: ["HomeConnect providers", "BeautyConnect providers", "SpareFinder dealers"],
      },
      {
        title: "What you need",
        body:
          "Prepare your business name, phone number, location, photos, service details, prices, and any documents needed for verification.",
        points: ["Contact details", "Photos or portfolio", "Verification information"],
      },
    ],
  },
  about: {
    eyebrow: "About ConnectMW",
    title: "Built by Malawians, for everyday Malawian services",
    subtitle: "ConnectMW brings rentals, beauty services, and auto spares into one local digital platform.",
    intro:
      "We are focused on making trusted local services easier to discover, compare, and contact without the chaos of scattered groups and unreliable middlemen.",
    primaryCta: { label: "Explore services", href: "/#services" },
    secondaryCta: { label: "Contact us", href: "/contact" },
    highlights: [
      { title: "Trust first", description: "Verification and clear profiles are central to the platform." },
      { title: "Local context", description: "The product is designed around Malawian markets and behavior." },
      { title: "Provider growth", description: "Small businesses get a stronger digital presence." },
    ],
    sections: [
      {
        title: "Our mission",
        body:
          "Make everyday services accessible, trustworthy, and efficient for every citizen by organizing local providers in one place.",
      },
      {
        title: "Where we are going",
        body:
          "We are expanding city by city, improving provider tools, and building a stronger customer experience across web and mobile.",
      },
    ],
  },
};

export const companyPages: Record<string, MarketingPageContent> = {
  mindtech: {
    eyebrow: "MiNDTech Company",
    title: "Digital Mind. Reliable Technology.",
    subtitle: "MiNDTech Company is the Malawian technology company behind ConnectMW.",
    intro:
      "MiNDTech builds practical digital products for local markets, with a focus on trust, access, and reliable service delivery.",
    primaryCta: { label: "Contact MiNDTech", href: "/contact" },
    secondaryCta: { label: "About ConnectMW", href: "/about" },
    highlights: [
      { title: "Product builder", description: "We design and ship platforms for real local needs." },
      { title: "Malawian owned", description: "Our work starts from the realities of our own market." },
      { title: "Reliable delivery", description: "We value practical systems customers can depend on." },
    ],
    sections: [
      {
        title: "What we build",
        body:
          "MiNDTech focuses on digital marketplaces, business tools, and service platforms that help people transact with more confidence.",
      },
      {
        title: "Our product",
        body:
          "ConnectMW is our flagship platform, connecting customers with trusted rental, beauty, and auto-spares providers.",
      },
    ],
  },
  careers: {
    eyebrow: "Careers",
    title: "Help build local technology that people can actually use",
    subtitle: "We are growing a thoughtful team around product, engineering, operations, design, and provider support.",
    intro:
      "Current openings may change as the company grows, but we are always interested in builders who understand local problems and care about reliable execution.",
    primaryCta: { label: "Send an enquiry", href: "/contact" },
    secondaryCta: { label: "Learn about MiNDTech", href: "/company/mindtech" },
    highlights: [
      { title: "Product minded", description: "We care about useful work, not noise." },
      { title: "Local impact", description: "The work touches real customers and providers." },
      { title: "Growing team", description: "Early contributors can shape the company culture." },
    ],
    sections: [
      {
        title: "Areas we hire for",
        body:
          "Engineering, product design, field operations, customer support, sales, marketing, and provider onboarding.",
        points: ["Software development", "Operations and support", "Growth and partnerships"],
      },
      {
        title: "How to reach us",
        body:
          "Use the contact page and include your area of interest, experience, location, and links to relevant work.",
      },
    ],
  },
  "press-media": {
    eyebrow: "Press & Media",
    title: "ConnectMW news, media, and company information",
    subtitle: "A clear source for press enquiries, product background, and brand information.",
    intro:
      "For media interviews, partnership announcements, product coverage, or company background, contact the ConnectMW team directly.",
    primaryCta: { label: "Contact press team", href: "/contact" },
    secondaryCta: { label: "About us", href: "/about" },
    highlights: [
      { title: "Company story", description: "ConnectMW is a MiNDTech Company product built in Malawi." },
      { title: "Product focus", description: "The platform covers rentals, beauty services, and auto spares." },
      { title: "Press contact", description: "Media enquiries can be routed through the contact page." },
    ],
    sections: [
      {
        title: "Media enquiries",
        body:
          "Please include your publication, deadline, topic, and preferred contact method when reaching out.",
      },
      {
        title: "Brand notes",
        body:
          "The product name is ConnectMW. The company name is MiNDTech Company. The tagline is Digital Mind. Reliable Technology.",
      },
    ],
  },
};

export const legalPages: Record<string, MarketingPageContent> = {
  "privacy-policy": {
    eyebrow: "Legal",
    title: "Privacy Policy",
    subtitle: "How ConnectMW handles personal information, account data, enquiries, and provider details.",
    intro:
      "This policy explains the types of information we collect, why we collect it, and the choices users have when using ConnectMW.",
    highlights: [
      { title: "Data minimization", description: "We collect information needed to operate and improve the platform." },
      { title: "User control", description: "Users can request updates or support for account information." },
      { title: "Security focus", description: "We use reasonable safeguards to protect platform data." },
    ],
    sections: [
      {
        title: "Information we collect",
        body:
          "We may collect account details, contact information, listing details, booking or enquiry information, usage data, and messages submitted through forms.",
        points: ["Name, phone number, email address, and account role", "Provider profiles, business details, listing photos, services, prices, and locations", "Customer enquiries, booking requests, support messages, and basic website usage information"],
      },
      {
        title: "How we use information",
        body:
          "We use information to provide accounts, manage listings, connect customers and providers, improve services, prevent misuse, and communicate important updates.",
        points: ["Create and manage user and provider accounts", "Show relevant listings and provider profiles", "Respond to support, safety, verification, and business enquiries"],
      },
      {
        title: "Sharing and protection",
        body:
          "We only share information where it is needed to operate the service, support a user request, comply with legal obligations, or protect the platform.",
        points: ["Customer contact details may be shared with providers when a user makes an enquiry", "Provider listing details may be visible publicly", "We use reasonable technical and operational safeguards for account and platform data"],
      },
      {
        title: "Contact",
        body:
          "For privacy questions or data requests, contact ConnectMW through the contact page.",
      },
    ],
  },
  "terms-of-service": {
    eyebrow: "Legal",
    title: "Terms of Service",
    subtitle: "The basic rules for using ConnectMW as a customer, provider, or visitor.",
    intro:
      "By using ConnectMW, users agree to use the platform responsibly, provide accurate information, and respect other users and providers.",
    highlights: [
      { title: "Accurate details", description: "Users and providers must provide truthful information." },
      { title: "Responsible use", description: "Misuse, fraud, and harmful conduct are not allowed." },
      { title: "Platform changes", description: "Features may be updated as ConnectMW develops." },
    ],
    sections: [
      {
        title: "Use of the platform",
        body:
          "ConnectMW helps customers discover providers and helps providers manage digital listings. Users remain responsible for decisions, communications, and agreements they enter.",
        points: ["Use the platform only for lawful and honest purposes", "Do not impersonate another person or business", "Do not submit false, harmful, or misleading information"],
      },
      {
        title: "Accounts and listings",
        body:
          "Account holders should keep login details secure. Providers must keep listings, pricing, availability, and contact details accurate.",
        points: ["You are responsible for activity on your account", "Listings may be reviewed, updated, paused, or removed when needed", "Provider verification may be required before some features are available"],
      },
      {
        title: "Bookings, enquiries, and payments",
        body:
          "Customers and providers are responsible for confirming service details, availability, pricing, delivery, and any direct agreements made outside the platform.",
        points: ["Always verify important details before paying or travelling", "Report suspicious conduct to ConnectMW", "Payment features may have additional instructions when enabled"],
      },
      {
        title: "Platform limitations",
        body:
          "ConnectMW may moderate content, suspend misuse, or remove inaccurate listings to protect the quality and safety of the platform.",
      },
    ],
  },
  "cookie-policy": {
    eyebrow: "Legal",
    title: "Cookie Policy",
    subtitle: "How cookies and similar technologies may be used on ConnectMW.",
    intro:
      "Cookies help the website remember preferences, support account sessions, understand usage, and keep the experience reliable.",
    highlights: [
      { title: "Essential cookies", description: "Needed for core site and account functionality." },
      { title: "Preference cookies", description: "Used to remember choices where available." },
      { title: "Analytics cookies", description: "May help us understand and improve site performance." },
    ],
    sections: [
      {
        title: "What cookies do",
        body:
          "Cookies are small files stored by a browser. They can help keep users signed in, remember settings, and understand how pages are used.",
        points: ["Support sign-in and account sessions", "Remember simple preferences", "Help us understand whether pages are working well"],
      },
      {
        title: "Types of cookies",
        body:
          "ConnectMW may use essential cookies for core features, preference cookies for saved choices, and analytics cookies to improve performance.",
        points: ["Essential cookies keep important features available", "Preference cookies make repeat visits easier", "Analytics cookies help identify pages or flows that need improvement"],
      },
      {
        title: "Managing your cookies",
        body:
          "Users can control cookies through browser settings. Some features may not work properly if essential cookies are blocked.",
      },
    ],
  },
  "provider-agreement": {
    eyebrow: "Legal",
    title: "Provider Agreement",
    subtitle: "Responsibilities for businesses and individuals listing services on ConnectMW.",
    intro:
      "Providers must keep profiles accurate, respect customer enquiries, and deliver services or listings honestly and professionally.",
    highlights: [
      { title: "Verified profiles", description: "Providers may be asked to submit details for review." },
      { title: "Clear listings", description: "Prices, availability, photos, and service descriptions should be accurate." },
      { title: "Professional conduct", description: "Customer communication should be timely and respectful." },
    ],
    sections: [
      {
        title: "Provider responsibilities",
        body:
          "Providers are responsible for their listings, service quality, pricing, availability, customer communication, and compliance with applicable laws.",
        points: ["Keep business names, locations, phone numbers, prices, and availability accurate", "Use original or properly authorized listing photos", "Respond to customer enquiries professionally and promptly"],
      },
      {
        title: "Listing quality",
        body:
          "ConnectMW may request edits, remove outdated listings, or pause provider access where information is misleading or harmful.",
        points: ["Listings should describe real services, properties, or parts", "Unavailable items should be updated or removed", "Misleading prices, fake photos, or unsafe conduct may lead to removal"],
      },
      {
        title: "Payments and disputes",
        body:
          "Where payments or bookings are supported, providers must follow platform instructions and cooperate in good faith to resolve customer issues.",
        points: ["Confirm payment instructions before accepting transactions", "Keep records of confirmed bookings or orders", "Work with ConnectMW support when a dispute is reported"],
      },
    ],
  },
};
