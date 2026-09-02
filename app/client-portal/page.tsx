import type { Metadata } from "next";
import { ClientPortal } from "@/components/ClientPortal";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata(
    "Client Portal Preview",
    "A RocketJump client workspace preview for website updates, design approvals and social-media reporting.",
    "/client-portal",
  ),
  robots: { index: false, follow: false },
};

export default function ClientPortalPage() {
  return <ClientPortal />;
}
