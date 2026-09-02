import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/web-design", "/branding", "/social-media", "/work", "/about", "/contact", "/privacy", "/terms"];
  return routes.map((route) => ({ url: `${siteConfig.url}${route}` }));
}
