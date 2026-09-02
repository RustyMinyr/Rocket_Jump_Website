import Link from "next/link";
import { CTASection, FeatureList, ProjectGrid, RocketGraphic, SectionHeading } from "@/components/UI";
import { processSteps, services, siteConfig, webFeatures } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-noise" aria-hidden="true" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">CREATIVE WEB STUDIO · GQEBERHA</span>
            <h1>Ideas That<br />Launch Brands<span>.</span></h1>
            <p>RocketJump is a Gqeberha web design studio helping small businesses across Gqeberha (Port Elizabeth) and the Eastern Cape build clear brands, fast websites and consistent social content.</p>
            <div className="button-row"><Link href="/contact" className="button">Let&apos;s Launch Your Brand <span>↗</span></Link><Link href="/work" className="button button-ghost">See Our Work <span>↗</span></Link></div>
            <div className="location-note"><span>⌖</span><div><small>BASED IN GQEBERHA</small><p>Working with small businesses across Port Elizabeth and the Eastern Cape.</p></div></div>
          </div>
          <RocketGraphic />
        </div>
        <div className="shell trust-strip" aria-label="Website inclusions">
          {['Modern Technology','Responsive Design','SEO Included','SSL Security','Local Support'].map((item) => <span key={item}><i>✓</i>{item}</span>)}
        </div>
      </section>

      <section className="intro section-light"><div className="shell intro-grid"><span className="eyebrow">BUILT FOR MOMENTUM</span><div><h2>Your website should do more than exist.</h2><p>Your website is often the first interaction someone has with your business. RocketJump creates modern, fast and memorable websites designed to build trust, generate enquiries and move your business forward.</p><p className="strong">No generic templates. No complicated process. Just a professional website built around your brand and your goals.</p></div></div></section>

      <section className="services section-light"><div className="shell"><SectionHeading eyebrow="WHAT WE DO" title="Everything your brand needs to stand out and grow."/><div className="service-grid">{services.map((service) => <article className={`service-card ${service.tone}`} key={service.title}><span className="service-number">{service.number}</span><div className="service-icon" aria-hidden="true"><i/></div><h3>{service.title}</h3><p>{service.description}</p><Link href={service.href}>{service.link} <span>↗</span></Link></article>)}</div></div></section>

      <section className="speciality"><div className="shell speciality-grid"><div><SectionHeading eyebrow="OUR SPECIALITY" title={siteConfig.positioning} copy="A great website needs more than attractive visuals. Every RocketJump website is designed around speed, responsive performance, user experience, security, search visibility and clear business goals."/><FeatureList items={webFeatures} columns={2}/><Link href="/web-design" className="button">Explore Web Design <span>↗</span></Link></div><div className="browser-art" aria-hidden="true"><div className="browser-top"><i/><i/><i/></div><div className="browser-screen"><span>HIGH-PERFORMANCE WEB DESIGN</span><strong>Built to move<br/>business forward.</strong><div className="metric-row"><b>FAST</b><b>SECURE</b><b>SCALABLE</b></div></div><div className="browser-glow"/></div></div></section>

      <section className="process"><div className="shell"><SectionHeading eyebrow="HOW IT WORKS" title="From idea to launch. Without the complexity."/><div className="process-grid">{processSteps.map(([number,title,copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="why"><div className="shell"><SectionHeading eyebrow="WHY ROCKETJUMP?" title="More than just a pretty website." align="center"/><div className="why-grid">{[
        ['◎','Strategy First','Every project begins with a clear understanding of your business and its goals.'],
        ['ϟ','Built for Performance','Fast, responsive and technically optimised from the beginning.'],
        ['↗','Growth Focused','Designed to create enquiries, build trust and support business growth.'],
        ['⌖','Local Support','Based in Gqeberha and supporting businesses throughout South Africa.']
      ].map(([icon,title,copy]) => <article key={title}><span>{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="work section-light"><div className="shell"><div className="heading-row"><SectionHeading eyebrow="RECENT WORK" title="Websites that make an impact."/><Link href="/work" className="text-link">View all work <span>↗</span></Link></div><ProjectGrid limit={3}/></div></section>

      <section className="dual-promo"><div className="shell promo-grid"><article className="promo-brand"><span className="eyebrow light">BRAND IDENTITY</span><h2>Build a brand people remember.</h2><p>From logos and colour palettes to complete visual systems, we create identities with confidence and consistency.</p><Link href="/branding" className="button button-dark">Explore Brand Identity <span>↗</span></Link></article><article className="promo-social"><span className="eyebrow light">SOCIAL MEDIA</span><h2>Stay visible. Stay relevant.</h2><p>Professional content that keeps your business active and recognisable across social media.</p><Link href="/social-media" className="button button-dark">Explore Social Media <span>↗</span></Link></article></div></section>
      <CTASection />
    </>
  );
}
