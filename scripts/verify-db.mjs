#!/usr/bin/env node
/**
 * Verify Supabase connection: read .env and call GET /api/services.
 * Run: node scripts/verify-db.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const content = readFileSync(".env", "utf8");
    const env = {};
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) {
        const v = m[2].trim();
        env[m[1]] = v.replace(/^["']|["']$/g, "");
      }
    }
    return env;
  } catch (e) {
    return {};
  }
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || url.startsWith("YOUR_") || url === "https://REPLACE_WITH_YOUR_PROJECT_REF.supabase.co") {
  console.error("Missing or placeholder NEXT_PUBLIC_SUPABASE_URL in .env");
  console.error("→ Open Supabase Dashboard → your project → Settings → API");
  console.error("→ Copy the 'Project URL' (Primary Database) and set in .env:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co");
  process.exit(1);
}

if (!key || !key.startsWith("sb_secret_")) {
  console.error("Missing or invalid SUPABASE_SERVICE_ROLE_KEY in .env (should start with sb_secret_)");
  process.exit(1);
}

async function main() {
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("services").select("id,name").eq("active", true).limit(5);
  if (error) {
    console.error("Database connection failed:", error.message);
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      console.error("→ Run the migrations in supabase/migrations/ (see docs/SETUP_STEP_BY_STEP.md)");
    }
    process.exit(1);
  }
  console.log("Database OK. Active services:", data?.length ?? 0);
  if (data?.length) {
    data.forEach((s) => console.log("  -", s.name));
  }
}

main();
