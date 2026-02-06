#!/usr/bin/env node
/**
 * Run the Arabic services fix SQL against your Supabase database from the CLI.
 * No browser needed.
 *
 * 1. Get your DB URL: Supabase Dashboard → Project → Settings → Database
 *    → "Connection string" → "URI" (copy; it includes the password).
 * 2. In project root, add to .env:
 *    DATABASE_URL=postgresql://postgres.[ref]:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres
 * 3. Run: node scripts/run-fix-arabic.mjs
 *
 * Requires: `pg` (npm install pg --save-dev) and DATABASE_URL in .env
 */

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
    const content = readFileSync(join(root, ".env"), "utf8");
    const env = {};
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) {
        const v = m[2].trim();
        env[m[1]] = v.replace(/^["']|["']$/g, "");
      }
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const databaseUrl = env.DATABASE_URL;

if (!databaseUrl || !databaseUrl.startsWith("postgresql://")) {
  console.error("Missing DATABASE_URL in .env");
  console.error("");
  console.error("1. Open Supabase Dashboard → your project → Settings → Database");
  console.error("2. Under 'Connection string' choose 'URI' and copy it");
  console.error("3. Add to .env (replace YOUR_PASSWORD with your database password):");
  console.error("   DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@...");
  console.error("");
  console.error("Then run: node scripts/run-fix-arabic.mjs");
  process.exit(1);
}

async function main() {
  let pg;
  try {
    pg = await import("pg");
  } catch (e) {
    console.error("Missing dependency. Run: npm install pg --save-dev");
    process.exit(1);
  }

  const sqlPath = join(root, "supabase", "FIX_SERVICES_ARABIC_RUN_ONCE.sql");
  const sql = readFileSync(sqlPath, "utf8");

  const client = new pg.default.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Done. Arabic service names have been applied.");
    console.log("Reload /ar/servizi and /ar/book to see the change.");
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
