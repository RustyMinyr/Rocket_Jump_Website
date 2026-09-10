import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("Terms & Conditions", "RocketJump terms and conditions.", "/terms");

export default function TermsPage() {
  return <section className="legal-page"><div className="shell legal-copy">
    <span className="eyebrow">THE BASICS</span>
    <h1>Terms &amp; Conditions</h1>
    <h2 id="giveaway">Find Roland website giveaway</h2>
    <p>You must be a resident of Gqeberha (Port Elizabeth) to enter.</p>
    <p>Find Roland on our About page and submit your name, email and dream website idea.</p>
    <p>The prize is one <Link href="/web-design">Launch Website package</Link> plus six months’ hosting.</p>
    <p>Entries close at the end of 29 September 2026, South African time. The winner will be chosen by lucky draw and announced on 30 September 2026.</p>
    <h2>Working with RocketJump</h2>
    <p>We agree on the work, price, payment and timing with you before starting. Extra work is quoted separately. You must have permission to use any content you supply.</p>
    <p>Hosting and maintenance are separate services, as set out in your quote.</p>
    <p>Questions? Email <a href="mailto:hello@rocketjump.co.za">hello@rocketjump.co.za</a>.</p>
  </div></section>;
}
