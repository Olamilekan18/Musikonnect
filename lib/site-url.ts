import type { NextRequest } from "next/server";

/** Keep OAuth redirects on the public host, including 127.0.0.1 in local development. */
export function siteUrl(request: NextRequest, path: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(path, configured);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ??
    (host?.startsWith("127.0.0.1") || host?.startsWith("localhost") ? "http" : "https");
  return new URL(path, host ? `${protocol}://${host}` : request.url);
}
