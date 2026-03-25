import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const route = createRouter();

route.get(getHandler);
route.patch(patchHandler);

export default route.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const foundUser = await user.findOneByUsername(request.query.username);
  return response.status(200).json(foundUser);
}

async function patchHandler(request, response) {
  const updatedUser = await user.update(request.query.username, request.body);
  return response.status(200).json(updatedUser);
}
