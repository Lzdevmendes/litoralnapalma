import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const GOOGLE_KEY        = Deno.env.get("GOOGLE_ROUTES_KEY") ?? "";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")      ?? "";
const ANON_KEY          = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

// Endpoints ficam no servidor — não vazam para o bundle do app
const HIGHWAY_ENDPOINTS: Record<string, {
  origin: { lat: number; lng: number };
  dest:   { lat: number; lng: number };
}> = {
  "rio-santos":       { origin: { lat: -23.7957, lng: -45.4082 }, dest: { lat: -23.6201, lng: -45.4129 } },
  "tamoios":          { origin: { lat: -23.6201, lng: -45.4129 }, dest: { lat: -23.1794, lng: -45.8869 } },
  "rio-santos-norte": { origin: { lat: -23.7957, lng: -45.4082 }, dest: { lat: -23.6201, lng: -45.4129 } },
  "rio-santos-sul":   { origin: { lat: -23.8500, lng: -45.4500 }, dest: { lat: -23.7957, lng: -45.4082 } },
  "rio-santos-uba":   { origin: { lat: -23.4336, lng: -45.0838 }, dest: { lat: -23.7957, lng: -45.4082 } },
  "tamoios-norte":    { origin: { lat: -23.1794, lng: -45.8869 }, dest: { lat: -23.4336, lng: -45.0838 } },
  "oswaldo-cruz":     { origin: { lat: -23.4336, lng: -45.0838 }, dest: { lat: -23.1909, lng: -45.9012 } },
  "acesso-porto-ss":  { origin: { lat: -23.8090, lng: -45.4080 }, dest: { lat: -23.8115, lng: -45.4139 } },
  "balsa":            { origin: { lat: -23.7957, lng: -45.4082 }, dest: { lat: -23.7779, lng: -45.3526 } },
  "perimetral":       { origin: { lat: -23.7779, lng: -45.3526 }, dest: { lat: -23.8453, lng: -45.3801 } },
  "centro-caraguatuba": { origin: { lat: -23.6201, lng: -45.4129 }, dest: { lat: -23.6350, lng: -45.4155 } },
};

function ratioToLevel(ratio: number): string {
  if (ratio < 1.1) return "livre";
  if (ratio < 1.4) return "moderado";
  if (ratio < 1.8) return "lento";
  return "parado";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  // Requer JWT de usuário autenticado
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }

  if (!GOOGLE_KEY) {
    return new Response(JSON.stringify({ error: "Routes API not configured" }), { status: 503 });
  }

  let body: { highwayIds: unknown };
  try {
    body = await req.json() as { highwayIds: unknown };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  if (!Array.isArray(body.highwayIds) || body.highwayIds.length === 0) {
    return new Response(JSON.stringify({ error: "highwayIds must be a non-empty array" }), { status: 400 });
  }

  // Sanitiza: só IDs conhecidos, no máximo 20 por chamada
  const validIds = (body.highwayIds as unknown[])
    .filter((id): id is string => typeof id === "string" && id in HIGHWAY_ENDPOINTS)
    .slice(0, 20);

  const settled = await Promise.allSettled(
    validIds.map(async (highwayId) => {
      const ep = HIGHWAY_ENDPOINTS[highwayId];

      const res = await fetch(GOOGLE_ROUTES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask": "routes.duration,routes.staticDuration",
        },
        body: JSON.stringify({
          origin:      { location: { latLng: { latitude: ep.origin.lat, longitude: ep.origin.lng } } },
          destination: { location: { latLng: { latitude: ep.dest.lat,   longitude: ep.dest.lng   } } },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
        }),
      });

      if (!res.ok) throw new Error(`Google Routes ${res.status}`);

      const json = await res.json() as {
        routes?: Array<{ duration: string; staticDuration: string }>;
      };
      const route = json.routes?.[0];
      if (!route) return { id: highwayId, data: null };

      const duration       = parseInt(route.duration.replace("s", ""), 10);
      const staticDuration = parseInt(route.staticDuration.replace("s", ""), 10);
      const ratio = staticDuration > 0 ? duration / staticDuration : 1;

      return {
        id: highwayId,
        data: { level: ratioToLevel(ratio), travelTime: Math.round(duration / 60) },
      };
    }),
  );

  const output: Record<string, { level: string; travelTime: number }> = {};
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value?.data) {
      output[r.value.id] = r.value.data;
    }
  }

  return new Response(JSON.stringify(output), {
    headers: { "Content-Type": "application/json" },
  });
});
