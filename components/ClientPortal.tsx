"use client";

import { useState } from "react";
import Link from "next/link";

type PortalTab = "overview" | "website" | "approvals" | "reporting";
type ApprovalStatus = "Awaiting review" | "Approved" | "Changes requested";

const portalTabs: { id: PortalTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "website", label: "Website" },
  { id: "approvals", label: "Approvals" },
  { id: "reporting", label: "Reporting" },
];

const initialApprovals = {
  website: "Awaiting review",
  social: "Awaiting review",
} satisfies Record<"website" | "social", ApprovalStatus>;

function StatusPill({ status }: { status: ApprovalStatus | "Live" | "On track" }) {
  const className = status === "Approved" || status === "Live" || status === "On track" ? "positive" : status === "Changes requested" ? "attention" : "pending";
  return <span className={`portal-status ${className}`}>{status}</span>;
}

export function ClientPortal() {
  const [signedIn, setSignedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>("overview");
  const [approvals, setApprovals] = useState(initialApprovals);
  const [websiteRequestSent, setWebsiteRequestSent] = useState(false);

  function enterPreview() {
    setSignedIn(true);
  }

  function setApproval(item: keyof typeof initialApprovals, status: ApprovalStatus) {
    setApprovals((current) => ({ ...current, [item]: status }));
  }

  if (!signedIn) {
    return <section className="portal-auth"><div className="shell portal-auth-grid"><div className="portal-auth-copy"><Link href="/" className="portal-home-link">← RocketJump</Link><span className="eyebrow">CLIENT PORTAL</span><h1>One place to keep your brand moving.</h1><p>Manage website requests, review designs and see your social-media reporting in a single RocketJump workspace.</p><div className="portal-auth-features"><span>Website updates</span><span>Design approvals</span><span>Reporting &amp; insights</span></div></div><div className="portal-login-card"><span className="portal-kicker">CLIENT PORTAL PREVIEW</span><h2>See the workspace in action.</h2><p>Active clients would receive an invite when their workspace is ready. This local prototype shows the experience using clearly marked sample content.</p><button className="button" type="button" onClick={enterPreview}>Open workspace preview <span>↗</span></button><p className="portal-preview-note">No passwords, client records or approval decisions are collected, stored or transmitted in this preview.</p></div></div></section>;
  }

  return <section className="portal-page"><div className="shell portal-shell"><header className="portal-topbar"><div><Link href="/" className="portal-home-link dark">← RocketJump</Link><span className="eyebrow">ROCKETJUMP CLIENT PORTAL</span><h1>Workspace preview</h1></div><div className="portal-profile"><span className="portal-avatar">RJ</span><div><strong>Example client</strong><small>Preview workspace</small></div><button type="button" onClick={() => setSignedIn(false)}>Exit preview</button></div></header><div className="portal-layout"><nav className="portal-nav" aria-label="Client portal navigation">{portalTabs.map((tab) => <button type="button" key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined}>{tab.label}</button>)}<p>All information in this preview is sample data.</p></nav><main className="portal-main">
      {activeTab === "overview" && <><div className="portal-main-heading"><div><span className="portal-kicker">GOOD TO SEE YOU</span><h2>Everything in motion, at a glance.</h2><p>Keep track of work in progress, reviews waiting for you and the latest social performance.</p></div><StatusPill status="On track" /></div><div className="portal-summary-grid"><article><span>WEBSITE</span><strong>Live</strong><p>Healthy, monitored and ready for your next update.</p></article><article><span>DESIGNS TO REVIEW</span><strong>{Object.values(approvals).filter((status) => status === "Awaiting review").length}</strong><p>Two concepts are ready for your feedback.</p></article><article><span>THIS MONTH&apos;S REACH</span><strong>14.8K</strong><p>Example reporting data, refreshed monthly.</p></article></div><div className="portal-work-grid"><article className="portal-panel portal-next-step"><span className="portal-kicker">NEXT UP</span><h3>Review the September social carousel.</h3><p>Three posts are ready for feedback before they are scheduled.</p><button type="button" className="portal-button" onClick={() => setActiveTab("approvals")}>Review designs <span>↗</span></button></article><article className="portal-panel"><span className="portal-kicker">LATEST REPORT</span><h3>July content performance</h3><div className="portal-mini-metrics"><span><b>+18%</b> reach</span><span><b>4.6%</b> engagement</span></div><button type="button" className="portal-text-button" onClick={() => setActiveTab("reporting")}>View reporting <span>↗</span></button></article></div></>}

      {activeTab === "website" && <><div className="portal-main-heading"><div><span className="portal-kicker">WEBSITE</span><h2>Your website, clearly looked after.</h2><p>See its current status, planned work and request a focused change when you need one.</p></div><StatusPill status="Live" /></div><div className="portal-work-grid"><article className="portal-panel portal-site-card"><div><span className="portal-kicker">YOUR WEBSITE</span><h3>examplebusiness.co.za</h3><p>Live website • SSL active • Performance review complete</p></div><span className="portal-live-dot">Live</span></article><article className="portal-panel"><span className="portal-kicker">REQUEST AN UPDATE</span><h3>Need a website change?</h3><p>Use your portal to send copy, imagery or a clear request to the RocketJump team.</p><button type="button" className="portal-button" onClick={() => setWebsiteRequestSent(true)}>{websiteRequestSent ? "Update request added" : "Request a change"} <span>↗</span></button>{websiteRequestSent && <small className="portal-feedback">Saved in this preview only.</small>}</article></div><article className="portal-panel portal-timeline"><span className="portal-kicker">CURRENT ACTIVITY</span><ol><li><time>Today</time><div><strong>Performance review complete</strong><p>Your latest website health check is ready to view.</p></div></li><li><time>Next</time><div><strong>Homepage promotion</strong><p>A new website banner is waiting for approval.</p></div></li></ol></article></>}

      {activeTab === "approvals" && <><div className="portal-main-heading"><div><span className="portal-kicker">APPROVALS</span><h2>Review work before it goes live.</h2><p>Keep feedback and approval decisions together, without long email threads.</p></div><StatusPill status={approvals.website} /></div><div className="portal-approval-grid"><article className="portal-panel portal-approval-card"><div className="portal-approval-art website-art"><span>WEBSITE</span><strong>Summer<br />promotion</strong></div><div className="portal-approval-copy"><div><span className="portal-kicker">WEBSITE UPDATE</span><h3>Homepage promotion</h3><p>New campaign banner and call to action.</p></div><StatusPill status={approvals.website} /><div className="portal-action-row"><button type="button" className="portal-button" onClick={() => setApproval("website", "Approved")}>Approve</button><button type="button" className="portal-quiet-button" onClick={() => setApproval("website", "Changes requested")}>Request changes</button></div></div></article><article className="portal-panel portal-approval-card"><div className="portal-approval-art social-art"><span>SOCIAL</span><strong>NEW<br />SEASON</strong></div><div className="portal-approval-copy"><div><span className="portal-kicker">SOCIAL CONTENT</span><h3>September carousel</h3><p>Three scheduled posts for your next campaign.</p></div><StatusPill status={approvals.social} /><div className="portal-action-row"><button type="button" className="portal-button" onClick={() => setApproval("social", "Approved")}>Approve</button><button type="button" className="portal-quiet-button" onClick={() => setApproval("social", "Changes requested")}>Request changes</button></div></div></article></div></>}

      {activeTab === "reporting" && <><div className="portal-main-heading"><div><span className="portal-kicker">REPORTING &amp; INSIGHTS</span><h2>Know what your content is doing.</h2><p>Your reporting brings the important numbers, the strongest content and useful next steps into one clear monthly view.</p></div><span className="portal-period">JULY · EXAMPLE REPORT</span></div><div className="portal-summary-grid portal-report-summary"><article><span>TOTAL REACH</span><strong>14.8K</strong><p><b>+18%</b> versus the previous month</p></article><article><span>ENGAGEMENTS</span><strong>682</strong><p><b>+11%</b> versus the previous month</p></article><article><span>POSTS PUBLISHED</span><strong>12</strong><p>Across your agreed content plan</p></article></div><div className="portal-report-grid"><article className="portal-panel portal-chart"><div><span className="portal-kicker">REACH TREND</span><h3>Content momentum</h3></div><div className="portal-bars" aria-label="Example monthly reach trend"><i style={{ height: "37%" }} /><i style={{ height: "52%" }} /><i style={{ height: "46%" }} /><i style={{ height: "72%" }} /><i style={{ height: "65%" }} /><i style={{ height: "88%" }} /></div><div className="portal-chart-labels"><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span></div></article><article className="portal-panel"><span className="portal-kicker">TOP CONTENT</span><h3>Behind-the-scenes reel</h3><p>Example performance summary: a timely, human post earned the strongest reach and saved engagement this month.</p><div className="portal-mini-metrics"><span><b>5.2K</b> reach</span><span><b>218</b> engagements</span></div><button type="button" className="portal-text-button">Download report <span>↗</span></button></article></div></>}
    </main></div></div></section>;
}
