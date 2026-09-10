"use client";

import { useState } from "react";
import Link from "next/link";

type PortalTab = "overview" | "reporting";

const portalTabs: { id: PortalTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "reporting", label: "Reporting" },
];

export function ClientPortal() {
  const [signedIn, setSignedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>("overview");

  function enterPreview() {
    setActiveTab("overview");
    setSignedIn(true);
  }


  if (!signedIn) {
    return <section className="portal-auth"><div className="shell portal-auth-grid"><div className="portal-auth-copy"><Link href="/" className="portal-home-link">← RocketJump</Link><span className="eyebrow">CLIENT PORTAL</span><h1>One place to keep your brand moving.</h1><p>Keep key project information and social-media reporting together in one clear RocketJump workspace.</p><div className="portal-auth-features"><span>Project overview</span><span>Reporting &amp; insights</span></div></div><div className="portal-login-card"><span className="portal-kicker">CLIENT PORTAL PREVIEW</span><h2>See the workspace in action.</h2><p>Active clients would receive an invite when their workspace is ready. This interactive preview shows the experience using clearly marked sample content.</p><button className="button" type="button" onClick={enterPreview}>Open workspace preview <span>↗</span></button><p className="portal-preview-note">No passwords or client records are collected, stored or transmitted in this preview.</p></div></div></section>;
  }

  return <section className="portal-page"><div className="shell portal-shell"><header className="portal-topbar"><div><Link href="/" className="portal-home-link dark">← RocketJump</Link><span className="eyebrow">ROCKETJUMP CLIENT PORTAL</span><h1>Workspace preview</h1></div><div className="portal-profile"><span className="portal-avatar">RJ</span><div><strong>Example client</strong><small>Preview workspace</small></div><button type="button" onClick={() => setSignedIn(false)}>Exit preview</button></div></header><div className="portal-layout"><nav className="portal-nav" aria-label="Client portal navigation">{portalTabs.map((tab) => <button type="button" key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined}>{tab.label}</button>)}<p>All information in this preview is sample data.</p></nav><div className="portal-main">
{activeTab === "overview" && <><div className="portal-main-heading"><div><span className="portal-kicker">GOOD TO SEE YOU</span><h2>Everything in motion, at a glance.</h2><p>Your website status, content activity and latest performance in one place.</p></div><span className="portal-status positive">On track</span></div><div className="portal-summary-grid"><article><span>WEBSITE</span><strong>Live</strong><p>Healthy, monitored and ready for your next update.</p></article><article><span>POSTS PUBLISHED</span><strong>12</strong><p>Across this month&apos;s sample content plan.</p></article><article><span>THIS MONTH&apos;S REACH</span><strong>14.8K</strong><p>Example reporting data, refreshed monthly.</p></article></div><div className="portal-work-grid"><article className="portal-panel portal-next-step"><span className="portal-kicker">PROJECT OVERVIEW</span><h3>Your website at a glance.</h3><p>examplebusiness.co.za</p><p>Website live · SSL active · Latest review complete</p></article><article className="portal-panel"><span className="portal-kicker">LATEST REPORT</span><h3>July content performance</h3><div className="portal-mini-metrics"><span><b>+18%</b> reach</span><span><b>4.6%</b> engagement</span></div><button type="button" className="portal-text-button" onClick={() => setActiveTab("reporting")}>View reporting <span>↗</span></button></article></div></>}


      {activeTab === "reporting" && <><div className="portal-main-heading"><div><span className="portal-kicker">REPORTING &amp; INSIGHTS</span><h2>Know what your content is doing.</h2><p>Your reporting brings the important numbers, the strongest content and useful next steps into one clear monthly view.</p></div><span className="portal-period">JULY · EXAMPLE REPORT</span></div><div className="portal-summary-grid portal-report-summary"><article><span>TOTAL REACH</span><strong>14.8K</strong><p><b>+18%</b> versus the previous month</p></article><article><span>ENGAGEMENTS</span><strong>682</strong><p><b>+11%</b> versus the previous month</p></article><article><span>POSTS PUBLISHED</span><strong>12</strong><p>Across your agreed content plan</p></article></div><div className="portal-report-grid"><article className="portal-panel portal-chart"><div><span className="portal-kicker">REACH TREND</span><h3>Content momentum</h3></div><div className="portal-bars" aria-label="Example monthly reach trend"><i style={{ height: "37%" }} /><i style={{ height: "52%" }} /><i style={{ height: "46%" }} /><i style={{ height: "72%" }} /><i style={{ height: "65%" }} /><i style={{ height: "88%" }} /></div><div className="portal-chart-labels"><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span></div></article><article className="portal-panel"><span className="portal-kicker">TOP CONTENT</span><h3>Behind-the-scenes reel</h3><p>Example performance summary: a timely, human post earned the strongest reach and saved engagement this month.</p><div className="portal-mini-metrics"><span><b>5.2K</b> reach</span><span><b>218</b> engagements</span></div><a className="portal-text-button" href="/samples/rocketjump-example-report.csv" download>Download sample report <span>↓</span></a></article></div></>}
    </div></div></div></section>;
}
