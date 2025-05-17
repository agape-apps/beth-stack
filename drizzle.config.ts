import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";

// Validate environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

// Check if required environment variables are defined
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

if (!DATABASE_AUTH_TOKEN) {
  throw new Error("DATABASE_AUTH_TOKEN environment variable is not defined");
}

export default defineConfig({
  // Path to your schema file
  schema: "./src/db/schema.ts",

  // Use turso dialect for Turso database
  dialect: "turso",

  // Database credentials
  dbCredentials: {
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  },

  // Output verbose logs during migrations
  verbose: true,

  // Enable strict mode for better type safety
  strict: true,

  // Output directory for migration files
  out: "./drizzle",

  // Optional: Configure migrations table name and schema
  migrations: {
    table: "__drizzle_migrations",
    schema: "drizzle"
  },

  // Optional: Specify tables to include/exclude in migrations
  // tablesFilter: ["*"],
} satisfies Config);
