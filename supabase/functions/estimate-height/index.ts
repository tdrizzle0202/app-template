// supabase/functions/estimate-height/index.ts

// Deno / Supabase deps
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- Types (mirror your app-side types) ----------
interface EstimateHeightRequest {
  id: string;
  photoPath: string; // storage object key: "<uid>/<filename>.ext"
  userInput?: string;
}

interface GeminiAnalysis {
  estimated_height_cm: number;
  explanation: string;
  method?: string | null;
  hint?: string | null;
}

interface EstimateHeightResponse {
  success: boolean;
  id: string;
  signedUrl: string;
  userInput: string;
  analysis: GeminiAnalysis;
}

interface EstimateHeightError {
  success: false;
  error: "bad_request" | "no_image" | "ai_failed";
  details?: string;
}

// ---------- CORS ----------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

// ---------- Prompt ----------
const GEMINI_PROMPT = `Estimate the subjet's height in centimeters using a single identifiable object in the photo as reference.

- Return ONLY JSON (no markdown):
{
  "estimated_height_cm": <number>,
  "explanation": "<~100 word numeric reasoning>"
}
`;

// ---------- Helpers ----------
function extToMime(pathOrUrl: string): string {
  const lower = pathOrUrl.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/heic";
  // Fallback to jpeg to stay compatible with your current uploads
  return "image/jpeg";
}

async function fetchAsBase64(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) {
    console.error(`[Internal] Image fetch failed: ${r.status} ${r.statusText}`);
    throw new Error('Image fetch failed');
  }
  const ab = await r.arrayBuffer();
  return base64Encode(new Uint8Array(ab));
}

function firstTextPart(data: any): string | null {
  const candidates = data?.candidates ?? [];
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  for (const c of candidates) {
    const parts = c?.content?.parts ?? [];
    for (const p of parts) {
      if (typeof p?.text === "string" && p.text.trim().length > 0) return p.text;
    }
  }
  return null;
}

async function callGemini(imageUrl: string, userInput: string, photoPathForMime: string): Promise<GeminiAnalysis> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash"; // use gemini-2.5-flash
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  // Prepare inline image
  const mime = extToMime(photoPathForMime);
  const imageB64 = await fetchAsBase64(imageUrl);

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${GEMINI_PROMPT}\nUser context: ${userInput || ""}` },
          { inline_data: { mime_type: mime, data: imageB64 } },
        ],
      },
    ],
    // Make Gemini return JSON text to avoid regex scrapes
    generation_config: {
      temperature: 0.1,
      max_output_tokens: 6000
    },
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await resp.text(); // read once for logging
  if (!resp.ok) {
    console.error(`[Internal] Gemini API error: ${resp.status}: ${raw || resp.statusText}`);
    throw new Error('AI service request failed');
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(`[Internal] Gemini returned non-JSON: ${raw.slice(0, 300)}...`);
    throw new Error('AI service returned invalid response');
  }

  // Safety / block checks
  if ((data?.candidates?.length ?? 0) === 0) {
    const block = data?.promptFeedback?.blockReason || "no_candidates";
    const safetyRatings = data?.promptFeedback?.safetyRatings;
    console.error(`[Internal] Gemini returned no candidates (reason: ${block})`, JSON.stringify(safetyRatings));
    throw new Error(`AI service could not process the image: ${block}`);
  }

  // Check for finish reason that indicates blocking
  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === "SAFETY") {
    const safetyRatings = data?.candidates?.[0]?.safetyRatings;
    console.error(`[Internal] Gemini blocked due to safety:`, JSON.stringify(safetyRatings));
    throw new Error('Image was blocked by safety filters. Please use a different photo.');
  }

  // Find first text part
  const text = firstTextPart(data);
  if (!text) {
    console.error('[Internal] Gemini response contained no text part. Full response:', JSON.stringify(data));
    throw new Error('AI service returned incomplete response. Please try again.');
  }

  // Parse the JSON the model returned
  let analysis: GeminiAnalysis;
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Also try to extract JSON from the text if it's embedded
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    analysis = JSON.parse(cleanText);
  } catch (parseError) {
    console.error(`[Internal] Gemini text was not valid JSON: ${text.slice(0, 300)}...`);
    throw new Error('AI service returned malformed response');
  }

  // Validate
  if (
    typeof analysis?.estimated_height_cm !== "number" ||
    typeof analysis?.explanation !== "string"
  ) {
    console.error('[Internal] Gemini JSON missing required fields');
    throw new Error('AI service response missing required data');
  }

  // Normalize optionals
  analysis.method = analysis.method ?? null;
  analysis.hint = analysis.hint ?? null;

  return analysis;
}

// ---------- HTTP Handler ----------
serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      const res: EstimateHeightError = {
          success: false,
        error: "bad_request",
        details: "Method not allowed",
      };
      return new Response(JSON.stringify(res), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse JSON safely
    let payload: EstimateHeightRequest | null = null;
    try {
      payload = (await req.json()) as EstimateHeightRequest;
    } catch {
      const res: EstimateHeightError = {
        success: false,
        error: "bad_request",
        details: "Invalid JSON body",
      };
      return new Response(JSON.stringify(res), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { id, photoPath, userInput = "" } = payload || ({} as EstimateHeightRequest);
    if (!id || !photoPath) {
      const res: EstimateHeightError = {
          success: false,
        error: "bad_request",
        details: "Missing required fields: id and photoPath",
      };
      return new Response(JSON.stringify(res), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate and sanitize userInput
    const sanitizedUserInput = userInput.trim();
    if (sanitizedUserInput.length > 500) {
      const res: EstimateHeightError = {
        success: false,
        error: "bad_request",
        details: "User input exceeds maximum length of 500 characters",
      };
      return new Response(JSON.stringify(res), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Env + Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      const res: EstimateHeightError = {
        success: false,
        error: "ai_failed",
        details: "Missing Supabase configuration",
      };
      return new Response(JSON.stringify(res), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    // Rate limiting: Check daily usage (20 requests per day)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await admin.auth.getUser(token);

      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error: countError } = await admin
          .from("height_results")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", today.toISOString());

        if (!countError && count !== null && count >= 20) {
          const res: EstimateHeightError = {
            success: false,
            error: "ai_failed",
            details: "Daily limit of 20 requests reached. Please try again tomorrow.",
          };
          return new Response(JSON.stringify(res), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    // Sanity guard for obviously-wrong paths
    if (photoPath.startsWith("/") || photoPath.startsWith("photos/") || photoPath.includes("://") || !photoPath.includes("/")) {
      const res: EstimateHeightError = {
          success: false,
        error: "no_image",
        details: "photoPath must be a storage object key like '<uid>/<filename>.jpg'",
      };
      return new Response(JSON.stringify(res), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1) Signed URL (10 minutes)
    const { data: signed, error: signErr } = await admin.storage.from("photos").createSignedUrl(photoPath, 600);
    if (signErr || !signed?.signedUrl) {
      const res: EstimateHeightError = {
          success: false,
        error: "no_image",
        details: signErr?.message || "Failed to create signed URL (check photoPath matches storage.objects.name)",
      };
      return new Response(JSON.stringify(res), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2) Gemini
    let analysis: GeminiAnalysis;
    try {
      analysis = await callGemini(signed.signedUrl, sanitizedUserInput, photoPath);
    } catch (e: any) {
      const res: EstimateHeightError = {
          success: false,
        error: "ai_failed",
        details: String(e?.message || e),
      };
      return new Response(JSON.stringify(res), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3) Update DB
    const { error: updateErr } = await admin
      .from("height_results")
        .update({
          height_cm: analysis.estimated_height_cm,
          explanation: analysis.explanation,
        method: analysis.method ?? null,
      })
      .eq("id", id);

    if (updateErr) {
      const res: EstimateHeightError = {
            success: false,
        error: "ai_failed",
        details: `Database update failed: ${updateErr.message}`,
      };
      return new Response(JSON.stringify(res), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 4) Respond
    const ok: EstimateHeightResponse = {
      success: true,
      id,
      signedUrl: signed.signedUrl,
      userInput: sanitizedUserInput,
      analysis,
    };
    return new Response(JSON.stringify(ok), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    const res: EstimateHeightError = {
        success: false,
      error: "ai_failed",
      details: String(err?.message || err),
    };
    return new Response(JSON.stringify(res), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

