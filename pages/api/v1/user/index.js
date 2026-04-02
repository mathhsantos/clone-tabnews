import { createRouter } from "next-connect";
import controller from "infra/controller";
import { parseSetCookie } from "set-cookie-parser";
import session from "models/session";
import user from "models/user";
import * as cookie from "cookie";

const route = createRouter();

route.get(getHandler);

export default route.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const requesCookies = parseSetCookie(request.headers.cookie, {
    map: true,
  });

  const sessionId = requesCookies.session_id.value;

  const foundSession = await session.getSessionById(sessionId);
  const foundUser = await user.findOneById(foundSession.user_id);
  const renewedSession = await session.renewSession(sessionId);

  const cookieSerialized = cookie.serialize(
    "session_id",
    renewedSession.token,
    {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    },
  );

  response.setHeader("Set-Cookie", cookieSerialized);
  response.setHeader(
    "Cache-Control",
    "no-store, must-revalidate, no-cache, max-age=0",
  );

  response.status(200).json(foundUser);
}
