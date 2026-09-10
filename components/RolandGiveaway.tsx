"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import styles from "./RolandGiveaway.module.css";

export default function RolandGiveaway() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [dodges, setDodges] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const positions = ["22%", "42%", "2%", "32%"];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/website-giveaway", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Please try again shortly.");
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t send your entry. Please try again.");
    } finally { setBusy(false); }
  }

  return <>
    <div className={styles.playArea} aria-label="Find Roland">
      <button ref={trigger} className={styles.roland} style={{ left: positions[dodges % positions.length] }}
        aria-label="Catch Roland and tell us about your dream website" aria-haspopup="dialog"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setDodges((count) => count + 1);
        }} onClick={() => dialog.current?.showModal()}>
        <Image src="/roland-helmet.png" alt="Roland wearing an astronaut helmet" width={240} height={240} className={styles.face} />
        <span>Catch me!</span>
      </button>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="roland-title"
      onClose={() => trigger.current?.focus()} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.inner}>
        <button className={styles.close} aria-label="Close entry form" onClick={() => dialog.current?.close()}>×</button>
        <p className={styles.eyebrow}>YOU FOUND ROLAND</p>
        <h2 id="roland-title">Your dream website starts here.</h2>
        {sent ? <div role="status"><p>Thanks! Your application has been sent to RocketJump.</p><button className={styles.submit} onClick={() => dialog.current?.close()}>All done</button></div> : <form onSubmit={submit}>
          <p>Win a Launch Website package with six months’ hosting. Open only to residents of Gqeberha (Port Elizabeth). The winner will be chosen by lucky draw.</p>
          <p className={styles.notice}>Entries close 29 September 2026. Winner announced 30 September 2026. <a href="/terms#giveaway">Giveaway details</a></p>
          <details className={styles.prize}><summary>What’s included?</summary><p>One custom-designed landing page, mobile-first design, a contact form and WhatsApp integration, Google Maps and social links, SSL security, basic SEO, performance optimisation and domain connection assistance—plus six months’ hosting.</p></details>
          <label>Name<input name="name" autoComplete="name" required maxLength={100} /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <fieldset><legend>Is your website personal or business?</legend><label><input type="radio" name="websiteType" value="Personal" required /> Personal</label><label><input type="radio" name="websiteType" value="Business" required /> Business</label></fieldset>
          <label>Tell us about your dream website<textarea name="description" required minLength={10} maxLength={5000} rows={4} /></label>
          <div hidden aria-hidden="true"><label>Leave blank<input name="company-url" tabIndex={-1} autoComplete="off" /></label></div>
          <p className={styles.notice}>We’ll use these details to review your application and contact you about your entry.</p>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button className={styles.submit} disabled={busy}>{busy ? "Sending…" : "Send my application"}</button>
        </form>}
      </div>
    </dialog>
  </>;
}
