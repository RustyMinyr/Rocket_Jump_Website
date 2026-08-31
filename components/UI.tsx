import Link from "next/link";
import { projects } from "@/lib/site";

export function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  return <div className={`section-heading ${align === "center" ? "center" : ""}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

export function RocketGraphic() {
  return <div className="rocket-scene" aria-hidden="true"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="trail trail-a"/><div className="trail trail-b"/><div className="trail trail-c"/><div className="rocket"><span className="window"/><span className="fin fin-left"/><span className="fin fin-right"/><span className="flame"/></div><div className="spark s1"/><div className="spark s2"/><div className="spark s3"/></div>;
}

export function FeatureList({ items, columns = 1 }: { items: readonly string[]; columns?: 1 | 2 }) {
  return <ul className={`feature-list columns-${columns}`}>{items.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>;
}

export function CTASection({ title = "Let’s build something incredible together.", copy = "Whether you are starting from scratch or ready to upgrade your online presence, RocketJump is ready to help you take the next step." }: { title?: string; copy?: string }) {
  return <section className="cta-section"><div className="shell cta-inner"><div><span className="eyebrow light">READY FOR LIFT-OFF?</span><h2>{title}</h2><p>{copy}</p></div><Link href="/contact" className="button button-dark">Get a Website Quote <span>↗</span></Link></div></section>;
}

export function ProjectGrid({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? projects.slice(0, limit) : projects;
  const isCompact = typeof limit === "number";
  return <div className={`project-grid ${isCompact ? "project-grid-compact" : "project-grid-detailed"}`}>{items.map((project) => <article className="project-card" key={project.slug}><div className="project-visual"><img src={project.image} alt={`Homepage snapshot of ${project.name}`} loading="lazy" decoding="async" /></div><div className="project-copy"><span className="demo-label">{project.label}</span><h3>{project.name}</h3><p>{project.summary}</p><div className="tag-row">{project.services.map((service) => <span key={service}>{service}</span>)}</div>{!isCompact && <div className="project-design"><h4>Design elements</h4><p>{project.design}</p></div>}{!isCompact && <div className="project-challenge"><h4>The challenge</h4><ul>{project.challenges.map((challenge) => <li key={challenge}>{challenge}</li>)}</ul></div>}<a className="text-link project-link" href={project.url} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name}`}>Visit live site <span>↗</span></a></div></article>)}</div>;
}

type Destination = "web" | "brand" | "social" | "work" | "about" | "contact";

function DestinationGraphic({ destination }: { destination: Destination }) {
  return <div className={`destination-scene destination-${destination}`} aria-hidden="true">
    <span className="destination-stars star-one" />
    <span className="destination-stars star-two" />
    <span className="destination-stars star-three" />
    <div className="destination-orbit orbit-outer" />
    <div className="destination-orbit orbit-inner" />
    <div className="destination-planet">
      <i className="planet-detail detail-one" />
      <i className="planet-detail detail-two" />
      <i className="planet-detail detail-three" />
      <b className="planet-symbol" />
    </div>
    <div className="destination-moon moon-one" />
    <div className="destination-moon moon-two" />
    <div className="destination-rocket"><i className="destination-window"/><i className="destination-flame"/></div>
    <div className="destination-route" />
  </div>;
}

export function PageHero({ eyebrow, title, copy, accent = "pink", visual = "web" }: { eyebrow: string; title: string; copy: string; accent?: "pink" | "orange" | "purple" | "cyan"; visual?: Destination }) {
  return <section className={`page-hero page-hero-${accent}`}><div className="shell page-hero-grid"><div className="page-hero-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p><Link className="button" href="/contact">Start a conversation <span>↗</span></Link></div><DestinationGraphic destination={visual}/></div></section>;
}
