import { isIP } from 'node:net';

// The Coolify container is reachable only through its Traefik proxy. Traefik
// overwrites X-Real-Ip and appends the connecting peer to X-Forwarded-For.
export function clientAddress(headers, { vercel = false, coolifyProxy = false } = {}) {
  let candidate = '';
  if (vercel) {
    candidate = (headers.get('x-vercel-forwarded-for') || headers.get('x-forwarded-for') || '').split(',')[0].trim();
  } else if (coolifyProxy) {
    candidate = (headers.get('x-real-ip') || '').trim();
    if (!isIP(candidate)) candidate = (headers.get('x-forwarded-for') || '').split(',').at(-1).trim();
  }
  return isIP(candidate) ? candidate : 'unknown-client';
}
