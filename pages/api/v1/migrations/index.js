import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import { createRouter } from "next-connect";
import controller from "infra/controller";

const route = createRouter();

route.get(getHandler);
route.post(postHandler);

export default route.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const migration = await generateMigration(true);
  return response.status(200).json(migration);
}

async function postHandler(request, response) {
  const migration = await generateMigration(false);
  return response.status(200).json(migration);
}

async function generateMigration(booleanDryRun) {
  let migration;
  let dbClient;

  try {
    dbClient = await database.createDbClient();

    migration = await migrationRunner({
      dryRun: booleanDryRun,
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });
  } finally {
    await dbClient?.end();
  }

  return migration;
}
