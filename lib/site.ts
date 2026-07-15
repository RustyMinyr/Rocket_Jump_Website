export const siteConfig = {
  name: "RocketJump",
  tagline: "Ideas That Launch Brands.",
  positioning: "Websites That Move Businesses Forward.",
  description:
    "A creative web studio in Gqeberha building high-performance websites, brand identities and social media momentum.",
  location: "Gqeberha, South Africa",
  serviceArea: "Businesses across South Africa",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rocketjump.co.za",
  email: "hello@rocketjump.co.za", // Placeholder - replace before commercial launch.
  phoneDisplay: "+27 82 123 4567", // Placeholder - replace before commercial launch.
  phoneHref: "+27821234567",
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
      "Branded content, scheduling and management that keeps your business active and relevant.",
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
  { slug: "bayline-property", name: "Bayline Property", industry: "Property", summary: "A polished property showcase designed around architectural confidence.", services: ["Web design", "Brand direction"], label: "Demonstration project", tone: "ocean" },
  { slug: "forge-fitness", name: "Forge Fitness", industry: "Fitness", summary: "A high-energy member journey for an ambitious training brand.", services: ["Web design", "Content system"], label: "Demonstration project", tone: "ember" },
  { slug: "salt-and-stone", name: "Salt & Stone", industry: "Restaurant", summary: "An inviting digital menu and booking experience for a coastal eatery.", services: ["Web design", "Brand identity"], label: "Demonstration project", tone: "saffron" },
  { slug: "wildcape-trails", name: "WildCape Trails", industry: "Tourism", summary: "Immersive trip planning for local adventures across the Eastern Cape.", services: ["Web design", "eCommerce"], label: "Demonstration project", tone: "forest" },
  { slug: "northline-advisory", name: "Northline Advisory", industry: "Professional services", summary: "A clear, credible service platform for a modern advisory practice.", services: ["Web design", "Copy structure"], label: "Demonstration project", tone: "violet" },
  { slug: "apex-build", name: "Apex Build Co.", industry: "Construction", summary: "A project-led website that makes capability and craft easy to trust.", services: ["Web design", "Lead generation"], label: "Demonstration project", tone: "steel" },
] as const;

export const websitePackages = [
  {
    name: "Launch Website",
    price: "From R2,499",
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

export const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "LinkedIn", href: "#" },
] as const;

export function pageMetadata(title: string, description: string, path: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: siteConfig.name, type: "website" as const, images: [{ url: "/og.png", width: 1728, height: 909, alt: "Ideas That Launch Brands — RocketJump" }] },
    twitter: { card: "summary_large_image" as const, title, description, images: ["/og.png"] },
  };
}
