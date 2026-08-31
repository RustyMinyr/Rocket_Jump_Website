# RocketJump Website

A production-oriented multi-page marketing website for RocketJump, a creative web studio in Gqeberha, South Africa.

## Local preview

1. Install Node.js 22.13 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and update the public site URL if needed.
4. Run `npm run dev`.
5. Open the local URL printed in the terminal.

Quality commands:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test`

## Vercel deployment

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep **Next.js** as the detected framework and set the Build Command to `npm run build:vercel`.
4. Add values from `.env.example` where required and set `NEXT_PUBLIC_SITE_URL` to the final production domain.
5. Deploy, then connect the production domain and trigger one final redeploy so canonical and social metadata use it.

## Content and asset replacement

- Update company and placeholder contact details in `lib/site.ts`.
- Replace the temporary CSS wordmark in `components/Logo.tsx` when final transparent logo files are available.
- Replace demonstration projects in `lib/site.ts` with genuine portfolio entries and approved project imagery.
- Replace placeholder social links in `lib/site.ts`.
- Have `/privacy` and `/terms` reviewed by a qualified legal professional.

## Contact form delivery

The contact form validates in the browser and submits to the server-side `/api/contact` route. Delivery uses Resend with server-only environment variables: `RESEND_API_KEY`, `EMAIL_FROM` and `CONTACT_TO_EMAIL`. Use a verified Rooiko sender identity, keep the API key out of source control, and set the submitter's email as the reply-to address.

## Future CMS

The central data structures in `lib/site.ts` can later be replaced by a headless CMS data layer without rewriting the presentation components. Suitable CMS-managed collections include services, packages, portfolio projects, testimonials, articles, team members, global settings and per-page SEO metadata.

## Analytics readiness

No analytics, advertising pixels or consent system is enabled by default. Add them through the root layout or a dedicated analytics component after a provider and privacy approach have been approved.
