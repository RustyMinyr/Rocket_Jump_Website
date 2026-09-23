// Next standalone can construct Request.url from its internal HOSTNAME/PORT even
// when the proxy forwards the public Host. Only the explicitly trusted Coolify
// path may restore that origin, and only for the configured public address.
/** @param {Request} request
 * @param {{trustedProxy?: boolean, origin?: string}} options */
export function requestWithTrustedOrigin(request, { trustedProxy = false, origin } = {}) {
  if (!trustedProxy) return request;
  let expected, internal;
  try {
    expected = new URL(origin);
    internal = new URL(request.url);
  } catch { return null; }
  if (!['http:', 'https:'].includes(expected.protocol)) return null;
  const host = request.headers.get('x-forwarded-host');
  const proto = request.headers.get('x-forwarded-proto');
  if (!host || !proto || host.toLowerCase() !== expected.host.toLowerCase() ||
      proto !== expected.protocol.slice(0, -1)) return null;
  const external = new URL(internal.pathname + internal.search, expected.origin);
  return new Request(external, request);
}
