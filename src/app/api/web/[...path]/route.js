import { NextResponse } from "next/server";

const LARAVEL_ORIGIN = (
  process.env.LARAVEL_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
)
  .trim()
  .replace(/\/+$/, "");

const SKIP_REQUEST_HEADERS = new Set(["host", "connection", "content-length", "transfer-encoding"]);

async function proxyToLaravel(request, context) {
  const { path = [] } = await context.params;
  const segments = Array.isArray(path) ? path.join("/") : String(path || "");
  const incoming = new URL(request.url);
  const target = `${LARAVEL_ORIGIN}/api/web/${segments}${incoming.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!SKIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    responseHeaders.set(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyToLaravel;
export const POST = proxyToLaravel;
export const PUT = proxyToLaravel;
export const PATCH = proxyToLaravel;
export const DELETE = proxyToLaravel;
