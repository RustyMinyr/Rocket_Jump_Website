# RocketJump self-hosted deployment

The site builds from this GitHub repository with the included Dockerfile. GitHub Actions checks the application and image on pull requests and pushes to `main`. After the checks pass, the operator deploys the reviewed `main` commit from GitHub in Coolify and confirms the running commit and health check.

The game and account features use PostgreSQL. Published images and other site assets are stored in the repository. Contact and giveaway forms use Resend. The application inventory found no upload endpoint, separate file store, or scheduled application job.

## Release sequence

1. Deploy staging and production as separate Coolify resources with dedicated PostgreSQL databases, credentials, and volumes. Keep previews private.
2. Test registration, login, saves, game telemetry, admin authorization, forms, health checks, and mail integration on a private preview.
3. Restore an encrypted source backup into an isolated database and compare every application table by row count and digest. Verify a second independent restore.
4. Freeze writes on the old deployment, take a final source copy, restore it, and repeat the data and application checks.
5. Change only the website DNS records after all earlier checks pass. Preserve mail and unrelated records. Verify DNS propagation, trusted HTTPS, and the public site.
6. Retain the old deployment and data for rollback until the new site passes live checks.

Server addresses, credentials, backup locations, DNS values, and detailed cutover commands belong in the private operator runbook outside this public repository.
