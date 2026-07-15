import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "RocketJump | Web Design Gqeberha", template: "%s | RocketJump" },
  description: siteConfig.description,
  keywords: ["Web design Gqeberha", "Website design South Africa", "Brand identity Gqeberha", "Social media management Gqeberha"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { title: "RocketJump — Ideas That Launch Brands", description: siteConfig.description, url: "/", siteName: siteConfig.name, locale: "en_ZA", type: "website", images: [{ url: "/og.png", width: 1728, height: 909, alt: "Ideas That Launch Brands — RocketJump" }] },
  twitter: { card: "summary_large_image", title: "RocketJump — Ideas That Launch Brands", description: siteConfig.description, images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": ["Organization", "ProfessionalService"], "@id": `${siteConfig.url}/#organization`, name: siteConfig.name, url: siteConfig.url, slogan: siteConfig.tagline, description: siteConfig.description, areaServed: "South Africa", address: { "@type": "PostalAddress", addressLocality: "Gqeberha", addressRegion: "Eastern Cape", addressCountry: "ZA" } },
    { "@type": "WebSite", "@id": `${siteConfig.url}/#website`, url: siteConfig.url, name: siteConfig.name, publisher: { "@id": `${siteConfig.url}/#organization` } },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={poppins.variable}><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/></body></html>;
}
