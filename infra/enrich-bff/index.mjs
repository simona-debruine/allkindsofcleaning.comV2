/**
 * Amplify-facing BFF: POST / (Function URL) → Property Enrichment Engine.
 * Keeps x-api-key server-side. SPA calls this URL (or Amplify 200-rewrite to it).
 */

const UPSTREAM = (
  process.env.PROPERTY_ENRICHMENT_URL ||
  "https://9ug42crh6h.execute-api.us-east-1.amazonaws.com/prod"
).replace(/\/$/, "");

const API_KEY = process.env.PROPERTY_ENRICHMENT_API_KEY || "";

const ALLOWED_ORIGINS = new Set(
  (
    process.env.CORS_ORIGINS ||
    [
      "https://allkindsofcleaning.com",
      "https://www.allkindsofcleaning.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].join(",")
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

function corsHeaders(origin) {
  const allow =
    origin && (ALLOWED_ORIGINS.has(origin) || /\.amplifyapp\.com$/i.test(origin))
      ? origin
      : "https://allkindsofcleaning.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

export async function handler(event) {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || null;
  const method =
    event.requestContext?.http?.method ||
    event.httpMethod ||
    "GET";

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(origin),
      body: "",
    };
  }

  if (method !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" }, origin);
  }

  if (!API_KEY) {
    return jsonResponse(
      503,
      {
        ok: false,
        error: "PROPERTY_ENRICHMENT_API_KEY is not configured on the enrich BFF.",
      },
      origin,
    );
  }

  const raw =
    typeof event.body === "string"
      ? event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body
      : JSON.stringify(event.body || {});

  try {
    const upstream = await fetch(`${UPSTREAM}/v1/property/enrich`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "User-Agent": "allkindsofcleaning-enrich-bff/0.1",
      },
      body: raw || "{}",
    });

    const text = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
      body: text,
    };
  } catch (err) {
    return jsonResponse(
      502,
      {
        ok: false,
        error: err instanceof Error ? err.message : "Enrichment proxy failed",
      },
      origin,
    );
  }
}
