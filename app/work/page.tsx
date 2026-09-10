import type { Metadata } from "next";
import { CTASection, PageHero, ProjectGrid, SectionHeading } from "@/components/UI";
import { pageMetadata } from "@/lib/site";
export const metadata: Metadata = pageMetadata("Website Design Portfolio", "Explore RocketJump website design work for Gqeberha teams and specialist businesses across South Africa.", "/work");

export default function WorkPage() {
  return <>
    <PageHero eyebrow="SELECTED WORK" title="Websites that make an impact." copy="Websites, platforms and new launches—each with its own purpose and personality." accent="cyan" visual="work"/>
    <section className="section-light work-page"><div className="shell"><SectionHeading eyebrow="OUR WORK" title="Unique solutions for every site." copy="A closer look at eight projects, from local businesses to specialist platforms."/><ProjectGrid/></div></section>
    <CTASection title="Your business could be next."/>
  </>;
}
