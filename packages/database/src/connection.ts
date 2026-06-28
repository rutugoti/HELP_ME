// ─────────────────────────────────────────────────────────────
// LastMinute — Database Connection Initialization
// Exports the shared Knex connection instance configured for
// the current environment (NODE_ENV).
// ─────────────────────────────────────────────────────────────

import knex, { type Knex } from "knex";
import config from "../knexfile";

const environment = process.env["NODE_ENV"] || "development";
const environmentConfig = config[environment];

if (!environmentConfig) {
  throw new Error(`Knex configuration for environment "${environment}" was not found in knexfile.`);
}

/**
 * Configure and initialize the Knex database instance.
 * Connection pooling is handled automatically by the Knex engine based
 * on the pool size settings defined in the knexfile.
 */
export const db: Knex = knex(environmentConfig);

export default db;
