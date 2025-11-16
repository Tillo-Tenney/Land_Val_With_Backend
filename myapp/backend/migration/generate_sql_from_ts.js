/**
 * FINAL — Bulletproof JSON extraction from TS data files
 * Works on Node 24 + Windows. No imports. No TypeScript execution.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to TS data files
const dataDir = path.resolve(__dirname, "../../frontend/src/data");

// Output folder
const outDir = path.resolve(__dirname, "./output");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function mysqlTypeForValue(val) {
  if (val === null) return "TEXT";
  if (typeof val === "number") return Number.isInteger(val) ? "BIGINT" : "DOUBLE";
  if (typeof val === "boolean") return "TINYINT(1)";
  if (typeof val === "object") return "JSON";
  return "TEXT";
}

/**
 * Extract array assigned to `export const something = [...]`
 */
function extractArray(text) {
  // 1. Find the assignment after "export const xxxx ="
  const match = text.match(/export\s+const\s+\w+\s*=\s*(\[[\s\S]*?\]);/m);
  if (!match) {
    throw new Error("No array found in TS file. Check export const format.");
  }

  let arrayLiteral = match[1];

  // 2. Convert TS literal → valid JSON
  arrayLiteral = arrayLiteral
    // Convert unquoted keys → quoted keys: id: → "id":
    .replace(/(\w+)\s*:/g, '"$1":')
    // Convert single quotes → double quotes
    .replace(/'/g, '"')
    // Remove trailing commas before closing ]
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');

  // 3. Parse JSON safely
  return JSON.parse(arrayLiteral);
}

function processTSFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const data = extractArray(text);

  const table = path.basename(filePath, ".ts");

  const columns = new Map();

  // Infer schema
  data.forEach(row => {
    Object.entries(row).forEach(([key, val]) => {
      if (!columns.has(key)) columns.set(key, mysqlTypeForValue(val));
    });
  });

  if (!columns.has("id")) columns.set("id", "VARCHAR(100)");

  // Build CREATE TABLE
  let schemaSql =
    `DROP TABLE IF EXISTS \`${table}\`;\nCREATE TABLE \`${table}\` (\n` +
    [...columns.entries()]
      .map(([col, type]) => `  \`${col}\` ${type}${col === "id" ? " PRIMARY KEY" : ""}`)
      .join(",\n") +
    `\n);\n\n`;

  // Build INSERT statements
  let insertsSql = "";
  data.forEach(row => {
    const cols = Object.keys(row);
    const vals = cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return "NULL";
      if (typeof v === "number") return v;
      if (typeof v === "boolean") return v ? 1 : 0;
      if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    insertsSql += `INSERT INTO \`${table}\` (\`${cols.join("`,`")}\`) VALUES (${vals.join(",")});\n`;
  });

  return { schemaSql, insertsSql };
}

async function run() {
  console.log("🔍 Reading TS files from:", dataDir);

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".ts"));
  let allSchema = "";
  let allInserts = "";

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    console.log("📄 Processing:", file);

    const { schemaSql, insertsSql } = processTSFile(filePath);

    allSchema += schemaSql;
    allInserts += insertsSql + "\n";
  }

  fs.writeFileSync(path.join(outDir, "schema.sql"), allSchema);
  fs.writeFileSync(path.join(outDir, "inserts.sql"), allInserts);

  console.log("\n✅ Migration complete!");
  console.log("➡ schema.sql");
  console.log("➡ inserts.sql");
}

run().catch(err => console.error("❌ ERROR:", err));