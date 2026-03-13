import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";
import { createRouter } from "next-connect";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const route = createRouter();

route.get(getHandler);

route.post(postHandler);

export default route.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

async function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.status_code).json(publicErrorObject);
}

async function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({ cause: error });

  console.log("\n Erro dentro do catch do next-connect");
  console.error(publicErrorObject);

  response.status(publicErrorObject.status_code).json(publicErrorObject);
}

async function getHandler(request, response) {
  const migration = await generateMigration(true);
  return response.status(200).json(migration);
}

async function postHandler(request, response) {
  const migration = await generateMigration(false);
  return response.status(200).json(migration);
}

async function generateMigration(booleandryrun) {
  const dbClient = await database.createDbClient();

  const migration = await migrationRunner({
    dryRun: booleandryrun,
    dbClient: dbClient,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  await dbClient.end();

  return migration;
}
