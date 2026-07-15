"use client";

import { FormEvent, useState } from "react";

type Errors = Record<string, string>;

const services = ["Launch Website", "Business Website", "Custom Website", "eCommerce", "Brand Identity", "Social Media Management", "Website Hosting", "Website Maintenance", "Professional Email", "Other"];
const budgets = ["Under R5,000", "R5,000–R10,000", "R10,000–R25,000", "R25,000–R50,000", "R50,000+", "Not sure yet"];

export function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "ready">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("website-field")) return;
    const next: Errors = {};
    for (const field of ["fullName", "email", "phone", "service", "budget", "description"]) {
      if (!String(form.get(field) || "").trim()) next[field] = "Please complete this field.";
    }
    const email = String(form.get("email") || "");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (form.get("consent") !== "on") next.consent = "Please confirm that we may respond to your request.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStatus("ready");
  }

  if (status === "ready") return <div className="form-status" role="status" tabIndex={-1}><span>✓</span><h2>Your project details are ready.</h2><p>The form passed validation, but email delivery has not been connected yet. Please email <a href="mailto:hello@rocketjump.co.za">hello@rocketjump.co.za</a> to send your enquiry while the integration is completed.</p><button className="button" onClick={() => setStatus("idle")}>Edit my details</button></div>;

  const fieldError = (name: string) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
  return (
    <form className="quote-form" onSubmit={handleSubmit} noValidate>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website-field">Leave this blank</label><input id="website-field" name="website-field" tabIndex={-1} autoComplete="off" /></div>
      <div className="form-grid">
        <label>Full name *<input name="fullName" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined}/>{fieldError("fullName")}</label>
        <label>Business name<input name="businessName" /></label>
        <label>Email address *<input name="email" type="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}/>{fieldError("email")}</label>
        <label>Phone number *<input name="phone" type="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined}/>{fieldError("phone")}</label>
        <label>Location<input name="location" /></label>
        <label>Existing website URL<input name="existingWebsite" type="url" placeholder="https://" /></label>
        <label>Service required *<select name="service" defaultValue="" aria-invalid={!!errors.service} aria-describedby={errors.service ? "service-error" : undefined}><option value="" disabled>Select a service</option>{services.map((service) => <option key={service}>{service}</option>)}</select>{fieldError("service")}</label>
        <label>Preferred website package<select name="package" defaultValue=""><option value="">Not applicable / not sure</option><option>Launch Website</option><option>Business Website</option><option>Custom Website</option></select></label>
        <label>Estimated budget *<select name="budget" defaultValue="" aria-invalid={!!errors.budget} aria-describedby={errors.budget ? "budget-error" : undefined}><option value="" disabled>Select a range</option>{budgets.map((budget) => <option key={budget}>{budget}</option>)}</select>{fieldError("budget")}</label>
        <label>Desired launch date<input name="launchDate" type="date" /></label>
        <label className="span-2">Tell us about your project *<textarea name="description" rows={6} placeholder="What do you need, and what should the project achieve?" aria-invalid={!!errors.description} aria-describedby={errors.description ? "description-error" : undefined}/>{fieldError("description")}</label>
        <label className="span-2">How did you hear about RocketJump?<input name="referral" /></label>
      </div>
      <label className="consent"><input name="consent" type="checkbox" /> <span>I consent to RocketJump using these details to respond to my enquiry. *</span></label>{fieldError("consent")}
      <button type="submit" className="button">Review my quote request <span>↗</span></button>
      <p className="form-note">No information is transmitted until an email service is connected. Required fields are marked with *.</p>
    </form>
  );
}
