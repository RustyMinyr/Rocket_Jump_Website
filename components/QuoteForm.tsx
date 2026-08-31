"use client";

import { FormEvent, useState } from "react";

type Errors = Record<string, string>;
type FormStatus = "idle" | "submitting" | "success";

const services = [
  "Launch Website",
  "Business Website",
  "Custom Website",
  "eCommerce",
  "Brand Identity",
  "Social Media",
  "Website Hosting",
  "Website Maintenance",
  "Other",
];
const budgets = ["Under R5,000", "R5,000–R10,000", "R10,000–R25,000", "R25,000–R50,000", "R50,000+", "Not sure yet"];

function formValue(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidWebsite(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function QuoteForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    if (formValue(form, "website-field")) return;

    const next: Errors = {};
    for (const field of ["fullName", "phone", "email", "service", "budget", "description"]) {
      if (!formValue(form, field)) next[field] = "Please complete this field.";
    }

    const email = formValue(form, "email");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";

    const currentSite = formValue(form, "currentSite");
    if (!isValidWebsite(currentSite)) next.currentSite = "Enter a valid website address, including https://.";

    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formValue(form, "fullName"),
          businessName: formValue(form, "businessName"),
          phone: formValue(form, "phone"),
          email,
          currentSite,
          service: formValue(form, "service"),
          budget: formValue(form, "budget"),
          description: formValue(form, "description"),
          "website-field": formValue(form, "website-field"),
        }),
      });

      if (!response.ok) throw new Error("Contact form delivery failed.");

      formElement.reset();
      setStatus("success");
    } catch {
      setStatus("idle");
      setSubmitError("We couldn’t send your enquiry right now. Please try again shortly.");
    }
  }

  if (status === "success") {
    return <div className="form-status" role="status" tabIndex={-1}><span>✓</span><h2>Thanks — your enquiry has been sent.</h2><p>We’ll review your project details and get back to you soon.</p><button className="button" onClick={() => setStatus("idle")}>Send another enquiry</button></div>;
  }

  const fieldError = (name: string) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
  const isSubmitting = status === "submitting";

  return (
    <form className="quote-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website-field">Leave this blank</label><input id="website-field" name="website-field" tabIndex={-1} autoComplete="off" /></div>
      <div className="form-grid">
        <label>Name *<input name="fullName" autoComplete="name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined}/>{fieldError("fullName")}</label>
        <label>Business name<input name="businessName" autoComplete="organization" /></label>
        <label>Phone *<input name="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined}/>{fieldError("phone")}</label>
        <label>Email *<input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}/>{fieldError("email")}</label>
        <label className="span-2">Current site<input name="currentSite" type="url" inputMode="url" placeholder="https://yourwebsite.co.za" aria-invalid={!!errors.currentSite} aria-describedby={errors.currentSite ? "currentSite-error" : undefined}/>{fieldError("currentSite")}</label>
        <label>Service required *<select name="service" defaultValue="" aria-invalid={!!errors.service} aria-describedby={errors.service ? "service-error" : undefined}><option value="" disabled>Select a service</option>{services.map((service) => <option key={service}>{service}</option>)}</select>{fieldError("service")}</label>
        <label>Estimated budget *<select name="budget" defaultValue="" aria-invalid={!!errors.budget} aria-describedby={errors.budget ? "budget-error" : undefined}><option value="" disabled>Select a range</option>{budgets.map((budget) => <option key={budget}>{budget}</option>)}</select>{fieldError("budget")}</label>
        <label className="span-2">Tell us about your project *<textarea name="description" rows={6} placeholder="What do you need, and what should the project achieve?" aria-invalid={!!errors.description} aria-describedby={errors.description ? "description-error" : undefined}/>{fieldError("description")}</label>
      </div>
      {submitError && <p className="form-submit-error" role="alert">{submitError}</p>}
      <button type="submit" className="button" disabled={isSubmitting}>{isSubmitting ? "Sending enquiry…" : <>Send enquiry <span>↗</span></>}</button>
      <p className="form-note">We&apos;ll only use these details to respond to your enquiry. Required fields are marked with *.</p>
    </form>
  );
}
