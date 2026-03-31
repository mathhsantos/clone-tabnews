import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import * as cookie from "cookie";
import authentication from "models/authentication.js";
import session from "models/session.js";

const route = createRouter();

route.post(postHandler);

export default route.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const authenticatedUser = await authentication.getAuthenticatedUser(
    request.body.email,
    request.body.password,
  );

  const newSession = await session.createSessionForUser(authenticatedUser.id);

  const cookieSerialized = cookie.serialize("session_id", newSession.token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
  });

  response.setHeader("Set-Cookie", cookieSerialized);

  return response.status(201).json(newSession);
}
