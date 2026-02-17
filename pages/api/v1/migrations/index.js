import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  let migration;

  if (request.method != "GET" && request.method != "POST") {
    return response.status(405).json({ data: "Method Not Allowed" });
  }

  if (request.method === "GET") {
    const dbClient = await database.createDbClient();

    migration = await migrationRunner({
      dryRun: true,
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    await dbClient.end();
    return response.status(200).json(migration);
  }

  if (request.method === "POST") {
    const dbClient = await database.createDbClient();

    migration = await migrationRunner({
      dryRun: false,
      dbClient: dbClient,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    await dbClient.end();
    return response.status(200).json(migration);
  }
}
