import type { Metadata } from "next";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";
import { SiteChrome } from "@/components/SiteChrome";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Web Design, Branding & Social Media in Gqeberha | RocketJump", template: "%s | RocketJump" },
  description: siteConfig.description,
  keywords: ["Web design Gqeberha", "Website design Port Elizabeth", "Small business websites Gqeberha", "Brand identity Gqeberha", "Social media content Gqeberha"],
  verification: { google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION || "QyKzSoF4jDl858uV2iNWRS8as-7y0kHgtRU0esr5Wis" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { title: "Web Design, Branding & Social Media in Gqeberha | RocketJump", description: siteConfig.description, url: "/", siteName: siteConfig.name, locale: "en_ZA", type: "website", images: [{ url: "/og.png", width: 1728, height: 909, alt: "Ideas That Launch Brands — RocketJump" }] },
  twitter: { card: "summary_large_image", title: "Web Design, Branding & Social Media in Gqeberha | RocketJump", description: siteConfig.description, images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/brand/rocketjump-primary-positive.png`,
      email: siteConfig.email,
      slogan: siteConfig.tagline,
      description: siteConfig.description,
      areaServed: [
        { "@type": "City", name: "Gqeberha" },
        { "@type": "AdministrativeArea", name: "Eastern Cape" },
        { "@type": "Country", name: "South Africa" },
      ],
      address: { "@type": "PostalAddress", addressLocality: "Gqeberha", addressRegion: "Eastern Cape", addressCountry: "ZA" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "RocketJump services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Website design" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "eCommerce website development" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Brand identity design" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Social media content and reporting" } },
        ],
      },
    },
    { "@type": "WebSite", "@id": `${siteConfig.url}/#website`, url: siteConfig.url, name: siteConfig.name, publisher: { "@id": `${siteConfig.url}/#organization` } },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><SiteChrome>{children}</SiteChrome><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/></body></html>;
}
