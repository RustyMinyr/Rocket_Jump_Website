"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ScrollMotion } from "./ScrollMotion";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname === "/client-portal";

  if (isPortal) return <main id="main">{children}</main>;

  return <><Header/><ScrollMotion/><main id="main">{children}</main><Footer/></>;
}
