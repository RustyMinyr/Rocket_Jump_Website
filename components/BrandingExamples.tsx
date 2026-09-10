import Image from "next/image";
import { SectionHeading } from "@/components/UI";

const identityGroups = [
  { tone: "light", identities: [
    { name: "AirKo", image: "airko.webp", theme: "airko" },
    { name: "EC Film Resource", image: "ec-film.svg", theme: "ec-film" },
    { name: "Drone Division", image: "drone-division.webp", theme: "drone-division" },
    { name: "Dasu", image: "dasu.svg", theme: "dasu" },
  ] },
  { tone: "dark", identities: [
    { name: "Studio GQ", image: "studio-gq.webp", theme: "studio-gq" },
    { name: "Unopened", image: "unopened-lockup.webp", theme: "unopened" },
    { name: "Roland Gaspar", image: "roland.webp", theme: "roland" },
  ] },
];

export function BrandingExamples() {
  return <section className="section-light branding-examples" aria-labelledby="branding-examples-title">
    <div className="shell">
      <div id="branding-examples-title"><SectionHeading eyebrow="SELECTED IDENTITIES" title="Different businesses. Distinct identities." copy="A selection of our logo and identity work, each with its own character." /></div>
      <div className="brand-logo-gallery">
        {identityGroups.map((group) => <div key={group.tone} className={`brand-logo-grid brand-logo-grid--${group.tone}`}>
          {group.identities.map((brand) => <figure key={brand.name} className={`brand-example brand-example--${brand.theme}`}>
            <div className="brand-example-art">
              {brand.theme === "roland" ? <div className="brand-roland-crop"><Image src={`/brand/examples/${brand.image}`} alt="Roland logo with Host. MC. Comedian. in cyan, purple and lime" width={1536} height={1024} sizes="(max-width: 600px) 85vw, 400px" /></div>
                : brand.theme === "unopened" ? <div className="brand-unopened-crop"><Image src={`/brand/examples/${brand.image}`} alt="Unopened logo — Rip it. Trade it. Keep it." width={1536} height={1024} sizes="(max-width: 600px) 85vw, 400px" /></div>
                : <div className="brand-logo-frame"><Image src={`/brand/examples/${brand.image}`} alt={`${brand.name} logo`} fill sizes="(max-width: 600px) 40vw, (max-width: 980px) 35vw, 260px" /></div>}
            </div>
          </figure>)}
        </div>)}
      </div>
      <div className="brand-application-heading"><SectionHeading eyebrow="DASU · DESIGN IN USE" title="Beyond the wordmark." copy="Geometric lettering, charcoal textures and an orange accent, brought together in campaign and stationery concepts." /></div>
      <div className="brand-application-grid">
        <figure><div><Image src="/brand/examples/dasu-campaign.webp" alt="Dasu campaign concept with a white geometric wordmark on a charcoal architectural wall" fill sizes="(max-width: 680px) 90vw, 50vw" /></div><figcaption>Campaign concept · Typography &amp; visual language</figcaption></figure>
        <figure><div><Image src="/brand/examples/dasu-stationery.webp" alt="Dasu stationery concept showing branded business cards, a folder and a notebook" fill sizes="(max-width: 680px) 90vw, 50vw" /></div><figcaption>Stationery concept · Colour, materials &amp; detail</figcaption></figure>
      </div>
    </div>
  </section>;
}
