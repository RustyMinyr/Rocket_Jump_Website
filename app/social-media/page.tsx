import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, PageHero, SectionHeading } from "@/components/UI";
import { pageMetadata } from "@/lib/site";
export const metadata: Metadata = pageMetadata("Social Media Strategy & Content Creation in Gqeberha", "Social media strategy, content creation, scheduling and reporting for small businesses in Gqeberha and Port Elizabeth.", "/social-media");

export default function SocialMediaPage() {
  const items = ["Social media strategy", "Content planning", "Content creation", "Post scheduling", "Brand consistency", "Reporting & insights"];

  return <>
    <PageHero eyebrow="SOCIAL MEDIA" title="Content that keeps your brand moving." copy="We help Gqeberha small businesses show up consistently with planned content, clear approvals and reporting that turns performance into the next useful decision." accent="purple" visual="social"/>
    <section className="section-light social-intro"><div className="shell"><SectionHeading eyebrow="A CLEAR OFFERING" title="The essentials, working together." copy="RocketJump plans, creates and schedules social content that stays true to your brand—and reports clearly on what it is achieving."/><div className="social-capabilities">{items.map((item, i) => <article key={item}><span>{String(i + 1).padStart(2, "0")}</span><h3>{item}</h3></article>)}</div></div></section>
    <section className="reporting-portal"><div className="shell reporting-portal-grid"><div><SectionHeading eyebrow="ROCKETJUMP PORTAL" title="Your content performance, in one clear view." copy="You stay in control of your social information. The RocketJump Portal brings reporting, performance trends, scheduled content and design reviews into one focused client workspace."/><div className="reporting-portal-actions"><Link href="/client-portal" className="button">Explore the client portal <span>↗</span></Link><span>You stay in control • Reports • Content calendar • Review &amp; approvals</span></div></div><div className="reporting-preview" aria-label="Example social-media report preview"><div className="reporting-preview-top"><span>CONTENT REPORTING</span><strong>July overview</strong><i>Example data</i></div><div className="reporting-metrics"><div><span>REACH</span><strong>14.8K</strong><small>+18% this month</small></div><div><span>ENGAGEMENTS</span><strong>682</strong><small>+11% this month</small></div></div><div className="reporting-bars" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><div className="reporting-preview-foot"><span>Top content</span><strong>Behind-the-scenes reel</strong></div></div></div></section>
    <section className="social-flow"><div className="shell split-section"><div><SectionHeading eyebrow="HOW WE WORK" title="Plan. Create. Publish. Learn." copy="A focused monthly rhythm takes content from an agreed plan to the right channels, then turns the reporting into the next useful decision."/></div><div className="feed-mock" aria-hidden="true"><div/><div/><div/><div/></div></div></section>
    <CTASection title="Ready to keep your brand moving?" copy="Tell us which platforms matter to your business and we’ll recommend a social content approach built around your goals."/>
  </>;
}
