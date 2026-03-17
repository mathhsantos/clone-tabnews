import generateMigration from "models/migrator";
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
