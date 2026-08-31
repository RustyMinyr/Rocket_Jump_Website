import type { Metadata } from "next";
import { CTASection, PageHero, ProjectGrid, SectionHeading } from "@/components/UI";
import { pageMetadata } from "@/lib/site";
export const metadata: Metadata = pageMetadata("Selected Website Work", "Explore selected RocketJump websites for aerial production, studio booking, commercial UAS operations and media-safety workflows.", "/work");

export default function WorkPage() {
  return <>
    <PageHero eyebrow="SELECTED WORK" title="Websites that make an impact." copy="A selection of real websites shaped around the strategy, craft and business thinking each client needed." accent="cyan" visual="work"/>
    <section className="section-light work-page"><div className="shell"><SectionHeading eyebrow="OUR WORK" title="Four sites. Four different challenges." copy="Each project begins with the real-world decisions its audience needs to make—from booking a production space to clearing sensitive media safely. Explore the live sites and the thinking behind each experience."/><ProjectGrid/></div></section>
    <CTASection title="Your business could be next."/>
  </>;
}
