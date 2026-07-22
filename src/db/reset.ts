import { sql } from "@/index";

async function main() {
  console.log("Dropping old table if exists...");
  await sql`DROP TABLE IF EXISTS users CASCADE;`;
  console.log("Done dropping old table.");
}

main().catch((err) => {
  console.error("Error resetting DB tables:", err);
  process.exit(1);
});
