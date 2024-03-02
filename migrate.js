const { migrate } = require("drizzle-orm/postgres-js/migrator");
const { drizzle } = require("drizzle-orm/node-postgres");
const pg = require("pg");

async function runMigrations() {
  // Because drizzle kit doesn't support neon HTTP yet, we have to use the node-postgres driver to run the migrations
  const client = new pg.Client({
    connectionString:
      // "postgresql://MichalMartinek:bqLn0rQg2VJx@ep-soft-paper-a27odznb-pooler.eu-central-1.aws.neon.tech/dmarc?sslmode=require",
      "postgresql://MichalMartinek:bqLn0rQg2VJx@ep-dry-cloud-a24rxlfn.eu-central-1.aws.neon.tech/trans?sslmode=require",
  });
  await client.connect();

  const db = drizzle(client);

  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: "./drizzle" });

  await client.end();
}

runMigrations();