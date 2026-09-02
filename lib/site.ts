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
  "Client portal access for progress, approvals and key information",
  "Local support from Gqeberha",
] as const;

export const processSteps = [
  ["01", "Discover", "We learn about your business, audience, goals and the problem your website needs to solve."],
  ["02", "Design", "We establish the visual direction, user journey and page structure."],
  ["03", "Develop", "We build with modern, high-performance technology."],
  ["04", "Review", "You review the complete website and guide the final refinements."],
  ["05", "Launch", "We test, connect your domain and launch it to the world."],
] as const;

export const projects = [
  {
    slug: "drone-division",
    name: "Drone Division",
    industry: "Aerial production",
    summary: "A production-focused website for a Gqeberha aerial team serving film, television, live events and specialist commercial work. It pairs cinematic positioning with clear evidence of compliant, licensed operations.",
    image: "/work/drone-division.png",
    design: "A crisp white navigation bar and aerial location image give the homepage the authority of a production call sheet. Oversized white type keeps the offer cinematic and clear, while the imagery carries the sense of scale.",
    challenges: ["Speak to film crews, event producers and industrial clients without diluting the offer.", "Balance showreel-led storytelling with confidence in safety, licensing and flight planning.", "Turn a complex, brief-led enquiry into a clear first conversation."],
    services: ["Website strategy", "Service journeys", "Lead generation"],
    label: "Client website",
    url: "https://www.dronedivision.co.za/",
  },
  {
    slug: "studio-gq",
    name: "Studio GQ",
    industry: "Studio hire & booking",
    summary: "A purpose-built studio platform for film, photography, podcasts, greenscreen and content production in Gqeberha. The site showcases the space and production support while guiding visitors into a structured booking journey.",
    image: "/work/studio-gq.png",
    design: "A near-black, editorial layout lets the portrait-led photography carry the experience. Fine white navigation and a persistent outlined booking action bring focus and restraint to a visually rich studio offer.",
    challenges: ["Make a flexible studio, equipment and support offering easy to understand at a glance.", "Collect date, session, extras and production requirements without making booking feel heavy.", "Keep visual proof, practical resources and booking calls to action working together."],
    services: ["Booking journey", "Content architecture", "Conversion design"],
    label: "Client website",
    url: "https://www.studiogq.co.za/",
  },
  {
    slug: "airko",
    name: "AirKo",
    industry: "UAS operations platform",
    summary: "A commercial UAS operational-control platform that brings UASOC oversight, teams, pilots, aircraft, readiness records and audit evidence into one clearer workflow—while keeping the final release decision with a human UASOC.",
    image: "/work/airko.png",
    design: "A spacious white canvas, navy wordmark and aqua accents establish a clear, regulated product identity. Oversized headline type sits alongside a flight-pack interface panel, turning the promise of control into visible proof.",
    challenges: ["Make distinct UASOC, team and pilot views legible without hiding the operational hierarchy.", "Explain dense readiness, review and authorisation workflows without creating a compliance-dashboard feel.", "Show automated decision support while preserving clear human regulatory authority."],
    services: ["Product messaging", "Complex workflows", "Trust design"],
    label: "Client website",
    url: "https://www.airko.co.za/",
  },
  {
    slug: "rooiko",
    name: "RooiKO",
    industry: "Media-safety workflow",
    summary: "A film-production media-safety platform for CardFLOW software and the CacheCLEAR hardware appliance. The site explains a verified workflow that protects independent copies and only allows authorised card clearing after repeated checks.",
    image: "/work/rooiko.png",
    design: "Deep black, topographic texture and warm orange highlights create a technical, on-set atmosphere. Structured uppercase navigation and restrained hero copy make the specialist tools feel engineered and purposeful.",
    challenges: ["Present hardware and software as one reliable on-set workflow rather than two separate products.", "Translate deep verification and evidence safeguards for crews working under real production pressure.", "Explain a fail-closed, irreversible media-clearance decision in straightforward language."],
    services: ["Technical storytelling", "Workflow design", "Trust & clarity"],
    label: "Client website",
    url: "https://www.rooiko.com/",
  },
] as const;

export const websitePackages = [
  {
    name: "Launch Website",
    price: "From R3,499",
    summary: "For startups, freelancers and small businesses that need a focused professional presence.",
    features: ["One custom-designed landing page", "Mobile-first responsive design", "Contact form and WhatsApp integration", "Google Maps and social links", "SSL security and basic SEO", "Performance optimisation", "Domain connection assistance", "Hosting available from R99/month"],
    cta: "Choose Launch",
    popular: false,
  },
  {
    name: "Business Website",
    price: "From R8,499",
    summary: "For established businesses that need more space to communicate, build trust and generate enquiries.",
    features: ["Up to five custom-designed pages", "Premium responsive layouts", "Contact and enquiry forms", "Galleries, maps and social integration", "SSL security and SEO setup", "Google Analytics setup", "Performance optimisation", "Hosting available from R99/month"],
    cta: "Choose Business",
    popular: true,
  },
  {
    name: "eCommerce Website",
    price: "From R14,999",
    summary: "For businesses that need a polished, dependable online store they own—without a Shopify-style platform subscription.",
    features: ["Your own custom eCommerce platform", "No Shopify or store-builder subscription", "Secure payment integration", "Shopping cart and streamlined checkout", "Shipping or collection options", "Order and stock management", "Discount codes and customer email", "Hosting available from R99/month"],
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
