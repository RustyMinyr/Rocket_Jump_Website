import type { Metadata } from "next";
import { CTASection, PageHero, ProjectGrid } from "@/components/UI";
import { pageMetadata } from "@/lib/site";
export const metadata: Metadata = pageMetadata("Selected Website Work", "Explore RocketJump demonstration website concepts across property, fitness, hospitality, tourism and more.", "/work");
export default function WorkPage(){return <><PageHero eyebrow="SELECTED WORK" title="Websites that make an impact." copy="A flexible portfolio built to showcase the strategy, craft and business thinking behind every RocketJump project." accent="cyan" visual="work"/><section className="section-light work-page"><div className="shell"><div className="portfolio-notice"><strong>Portfolio preview</strong><p>These clearly labelled demonstration projects show the intended presentation format. Genuine client work can replace them without redesigning the page.</p></div><ProjectGrid/></div></section><CTASection title="Your business could be next."/></>}
