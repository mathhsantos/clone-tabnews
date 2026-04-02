import { createRouter } from "next-connect";
import { parseSetCookie } from "set-cookie-parser";
import controller from "infra/controller.js";
import * as cookie from "cookie";
import authentication from "models/authentication.js";
import session from "models/session.js";

const route = createRouter();

route.post(postHandler);
route.delete(deleteHandler);

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

async function deleteHandler(request, response) {
  const requesCookies = parseSetCookie(request.headers.cookie, {
    map: true,
  });

  const sessionId = requesCookies?.session_id?.value;

  const foundSession = await session.getSessionById(sessionId);
  const expiredSession = await session.expireSession(foundSession.token);

  const cookieSerialized = cookie.serialize("session_id", "invalid", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: -1,
  });

  response.setHeader("Set-Cookie", cookieSerialized);

  response.status(200).json(expiredSession);
}
