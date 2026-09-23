// Proxy de l'API ewgf.gg en production : l'équivalent du proxy de vite.config.js,
// qui n'existe qu'avec `npm run dev`. Le token vient des variables
// d'environnement Netlify et n'atteint jamais le navigateur.

const EWGF_BASE = "https://api.ewgf.gg/external";

export default async (request) => {
  const token = process.env.EWGF_TOKEN;
  if (!token) {
    return Response.json(
      { error: "EWGF_TOKEN absent des variables d'environnement Netlify." },
      { status: 500 }
    );
  }

  // /api/ewgf/battles/<tekkenId> -> https://api.ewgf.gg/external/battles/<tekkenId>
  const path = new URL(request.url).pathname.replace(/^\/api\/ewgf/, "");
  const upstream = await fetch(`${EWGF_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Statut et en-têtes de quota relayés tels quels : le client s'en sert
  // pour expliquer un 401, un 404 ou un 429.
  const headers = new Headers({
    "Content-Type": upstream.headers.get("Content-Type") || "application/json",
  });
  const reset = upstream.headers.get("X-Ratelimit-Reset");
  if (reset) headers.set("X-Ratelimit-Reset", reset);

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers,
  });
};

export const config = { path: "/api/ewgf/*" };
