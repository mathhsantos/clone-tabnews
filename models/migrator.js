import database from "infra/database";
import { ServiceError } from "infra/errors";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function generateMigration(booleanDryRun) {
  let migration;
  let dbClient;

  try {
    dbClient = await database.createDbClient();

    migration = await migrationRunner({
      dryRun: booleanDryRun,
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      log: () => {},
      migrationsTable: "pgmigrations",
    });
  } catch (error) {
    throw new ServiceError({
      message: "Erro ao executar migration",
      cause: error,
    });
  } finally {
    await dbClient?.end();
  }

  return migration;
}
