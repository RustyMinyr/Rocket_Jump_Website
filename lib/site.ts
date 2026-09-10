export const siteConfig = {
  name: "RocketJump",
  tagline: "Ideas That Launch Brands.",
  positioning: "Websites That Move Businesses Forward.",
  description:
    "RocketJump is a creative web studio in Gqeberha helping small businesses build high-performance websites, clear brand identities and consistent social content.",
  location: "Gqeberha, South Africa",
  serviceArea: "Gqeberha (Port Elizabeth) and the Eastern Cape",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.rocketjump.co.za",
  email: "hello@rocketjump.co.za",
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Web Design", href: "/web-design" },
  { label: "Branding", href: "/branding" },
  { label: "Social Media", href: "/social-media" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const services = [
  {
    number: "01",
    title: "Web Design",
    description:
      "Beautiful, responsive websites built to perform, load quickly and turn visitors into customers.",
    href: "/web-design",
    link: "Explore Web Design",
    tone: "pink",
  },
  {
    number: "02",
    title: "Brand Identity",
    description:
      "Cohesive logos, colour systems and visual guidelines that make your business recognisable.",
    href: "/branding",
    link: "Build Your Brand",
    tone: "orange",
  },
  {
    number: "03",
    title: "Social Media",
    description:
      "Strategy, planned content, scheduling and reporting that keeps your business active and recognisable.",
    href: "/social-media",
    link: "Grow Your Audience",
    tone: "purple",
  },
] as const;

export const webFeatures = [
  "Custom-designed for your business",
  "Responsive across every screen",
  "Fast global content delivery",
  "SSL security included",
  "Search-engine-friendly architecture",
  "Built using modern web technology",
  "Clear calls to action",
  "Client portal preview for your overview, reports and key information",
  "Local support from Gqeberha",
] as const;

export const processSteps = [
  ["01", "Discover", "We learn about your business, audience, goals and the problem your website needs to solve."],
  ["02", "Design", "We establish the visual direction, user journey and page structure."],
  ["03", "Develop", "We build with modern, high-performance technology."],
  ["04", "Review", "You review the complete website and guide the final refinements."],
  ["05", "Launch", "We test, connect your domain and launch it to the world."],
] as const;

export type PortfolioImage = { src: string; label: string; alt: string };

export const projects = [
  {
    "slug": "ecfilm",
    "name": "EC Film",
    "industry": "Film resources & learning",
    "summary": "An editorial-style hub for Eastern Cape film production, bringing crew, locations and practical learning together through clear navigation and warm, understated design.",
    "url": "https://ecfilm.co.za/",
    "status": "",
    "linkLabel": "View website",
    "images": [
      {
        "src": "/work/portfolio/ecfilm-home.webp",
        "label": "Homepage",
        "alt": "EC Film homepage with editorial typography and production resources"
      },
      {
        "src": "/work/portfolio/ecfilm-courses.webp",
        "label": "Online courses",
        "alt": "EC Film online courses page"
      },
      {
        "src": "/work/portfolio/ecfilm-locations.webp",
        "label": "Film locations",
        "alt": "EC Film Eastern Cape film locations page"
      }
    ]
  },
  {
    "slug": "studio-gq",
    "name": "Studio GQ",
    "industry": "Studio hire & booking",
    "summary": "Cinematic photography and a clean monochrome layout showcase the studio, with straightforward routes to explore services and book a session.",
    "url": "https://studiogq.co.za/",
    "status": "",
    "linkLabel": "View website",
    "images": [
      {
        "src": "/work/portfolio/studio-gq-home.webp",
        "label": "Homepage mockup",
        "alt": "Studio GQ website displayed on a studio monitor"
      },
      {
        "src": "/work/portfolio/studio-gq-services.webp",
        "label": "Services mockup",
        "alt": "Studio GQ services website displayed on a laptop"
      },
      {
        "src": "/work/portfolio/studio-gq-booking.webp",
        "label": "Booking mockup",
        "alt": "Studio GQ booking page displayed on a tablet"
      }
    ]
  },
  {
    "slug": "rooiko",
    "name": "RooiKo",
    "industry": "Custom software & systems",
    "summary": "Bold typography, dark surfaces and orange accents give this software and hardware studio a distinctive home for its services, systems and projects.",
    "url": "https://rooiko.com/",
    "status": "",
    "linkLabel": "View website",
    "images": [
      {
        "src": "/work/portfolio/rooiko-home.webp",
        "label": "Homepage",
        "alt": "RooiKo homepage with purpose-built systems headline"
      },
      {
        "src": "/work/portfolio/rooiko-services.webp",
        "label": "Services",
        "alt": "RooiKo custom software and systems services page"
      },
      {
        "src": "/work/portfolio/rooiko-hardware.webp",
        "label": "Hardware",
        "alt": "RooiKo hardware page"
      }
    ]
  },
  {
    "slug": "drone-division",
    "name": "Drone Division",
    "industry": "Aerial film & media",
    "summary": "Large aerial imagery sets the scene, while crisp typography and focused service pages make specialist drone production easy to explore.",
    "url": "https://dronedivision.co.za/",
    "status": "",
    "linkLabel": "View website",
    "images": [
      {
        "src": "/work/portfolio/drone-division-home.webp",
        "label": "Homepage",
        "alt": "Drone Division homepage featuring an aerial coastline"
      },
      {
        "src": "/work/portfolio/drone-division-studio.webp",
        "label": "Laptop mockup",
        "alt": "Drone Division homepage displayed on a laptop"
      },
      {
        "src": "/work/portfolio/drone-division-technology.webp",
        "label": "Technology",
        "alt": "Drone Division technology page showcasing drone equipment"
      }
    ]
  },
  {
    "slug": "dasu",
    "name": "Dasu",
    "industry": "Creative collaboration platform",
    "summary": "A focused dark interface for sharing work, managing teams and reviewing creative projects, with orange accents keeping actions and feedback easy to find.",
    "url": "https://dasu.co.za/",
    "status": "",
    "linkLabel": "View website",
    "images": [
      {
        "src": "/work/portfolio/dasu-home.webp",
        "label": "Review showcase",
        "alt": "Dasu video-review showcase with comments and playback controls"
      },
      {
        "src": "/work/portfolio/dasu-review.webp",
        "label": "Review workspace",
        "alt": "Dasu client review folders"
      },
      {
        "src": "/work/portfolio/dasu-send.webp",
        "label": "File sharing",
        "alt": "Dasu file-sharing interface"
      },
      {
        "src": "/work/portfolio/dasu-team.webp",
        "label": "Team workspace",
        "alt": "Dasu team-management interface"
      }
    ]
  },
  {
    "slug": "unopened",
    "name": "Unopened",
    "industry": "Collectibles & eCommerce",
    "summary": "Neon colour, bold type and product-led layouts introduce a Pokémon collecting brand through a launch page built around sealed, single and graded cards.",
    "url": "https://unopened.co.za/",
    "status": "Launch preview",
    "linkLabel": "View landing page",
    "images": [
      {
        "src": "/work/portfolio/unopened-home.webp",
        "label": "Launch page",
        "alt": "Unopened launch page featuring Pokémon cards and neon headlines"
      },
      {
        "src": "/work/portfolio/unopened-collection.webp",
        "label": "The collection",
        "alt": "Unopened page introducing sealed, single and graded cards"
      }
    ]
  },
  {
    "slug": "airko",
    "name": "AirKo",
    "industry": "Drone operations platform",
    "summary": "A clear navy-and-teal design makes a complex drone operations platform approachable, with structured pages for teams, pilots and operational oversight.",
    "url": "https://airko.co.za/",
    "status": "",
    "linkLabel": "View website",
    "images": [
      {
        "src": "/work/portfolio/airko-home.webp",
        "label": "Homepage",
        "alt": "AirKo operational-control homepage"
      },
      {
        "src": "/work/portfolio/airko-platform.webp",
        "label": "The platform",
        "alt": "AirKo platform overview page"
      },
      {
        "src": "/work/portfolio/airko-team.webp",
        "label": "Team workflows",
        "alt": "AirKo team operations page"
      }
    ]
  },
  {
    "slug": "roland-gaspar",
    "name": "Roland Gaspar",
    "industry": "Host, MC & comedian",
    "summary": "A playful, personality-led landing page with bold lettering and bright accents. A first look at Roland’s new online home.",
    "url": "https://www.rolandgaspar.co.za/",
    "status": "Website coming 18 September",
    "linkLabel": "View landing page",
    "images": [
      {
        "src": "/work/portfolio/roland-home.webp",
        "label": "Landing page",
        "alt": "Roland Gaspar landing page with Host, MC, Comedian branding"
      }
    ]
  }
] as const;

export const websitePackages = [
  {
    name: "Launch Website",
    price: "From R4,999",
    summary: "For startups, freelancers and small businesses that need a focused professional presence.",
    features: ["One custom-designed landing page", "Mobile-first responsive design", "Contact form and WhatsApp integration", "Google Maps and social links", "SSL security and basic SEO", "Performance optimisation", "Domain connection assistance", "Hosting available from R99/month"],
    cta: "Choose Launch",
    popular: false,
  },
  {
    name: "Business Website",
    price: "From R9,499",
    summary: "For established businesses that need more space to communicate, build trust and generate enquiries.",
    features: ["Up to five custom-designed pages", "Premium responsive layouts", "Contact and enquiry forms", "Galleries, maps and social integration", "SSL security and SEO setup", "Google Analytics setup", "Performance optimisation", "Hosting available from R99/month"],
    cta: "Choose Business",
    popular: true,
  },
  {
    name: "eCommerce Website",
    price: "From R18,999",
    summary: "For businesses that need a polished, dependable online store they own—without a Shopify-style platform subscription.",
    features: ["Your own custom eCommerce platform", "No Shopify or store-builder subscription", "Secure payment integration", "Shopping cart and streamlined checkout", "Shipping or collection options", "Order and stock management", "Discount codes and customer email", "eCommerce hosting R199/month"],
    cta: "Choose eCommerce",
    popular: false,
  },
  {
    name: "Custom Website",
    price: "Quoted to your requirements",
    summary: "For businesses that need custom functionality, integrated data or a purpose-built platform.",
    features: ["Multi-page websites", "Booking systems and client portals", "Membership platforms", "Dashboards and directories", "API and AI integrations", "Advanced forms and workflows", "Database-driven features", "Content-management systems"],
    cta: "Request a Custom Quote",
    popular: false,
  },
] as const;

export const maintenancePackages = [
  { name: "Essential Maintenance", price: "From R199/month", features: ["Website, SSL and broken-link monitoring", "Basic performance monitoring", "Dependency and monthly website review", "Email support", "15 minutes of minor content changes"] },
  { name: "Business Care", price: "From R499/month", features: ["Everything in Essential", "45 minutes of content updates", "Text, image and form updates", "Basic SEO health checks", "Priority support"] },
  { name: "Growth Care", price: "From R999/month", features: ["Everything in Business Care", "Two hours of website updates", "New sections and content uploads", "Analytics and SEO improvements", "Conversion recommendations"] },
] as const;

export function pageMetadata(title: string, description: string, path: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: siteConfig.name, locale: "en_ZA", type: "website" as const, images: [{ url: "/og.png", width: 1728, height: 909, alt: "Ideas That Launch Brands — RocketJump" }] },
    twitter: { card: "summary_large_image" as const, title, description, images: ["/og.png"] },
  };
}
