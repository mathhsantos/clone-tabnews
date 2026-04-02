import orchestrator from "test/orchestrator.js";
import database from "infra/database.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "validsession",
            password: "senha123",
            email: "validsession@email.com",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);
      const createdUserBody = await createUserResponse.json();

      const createSessionResponse = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "validsession@email.com",
            password: "senha123",
          }),
        },
      );

      expect(createSessionResponse.status).toBe(201);
      const createSessionBody = await createSessionResponse.json();
      const sessionCookie = createSessionResponse.headers.get("set-cookie");

      expect(sessionCookie).toBeTruthy();

      const sessionBeforeResponse = await database.query({
        text: `
          SELECT
            expires_at
          FROM
            sessions
          WHERE
            token = $1
          ;`,
        values: [createSessionBody.token],
      });

      const expiresAtBeforeRenew = sessionBeforeResponse.rows[0].expires_at;

      const response2 = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: sessionCookie,
        },
      });

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: createdUserBody.id,
        username: "validsession",
        email: "validsession@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();

      const sessionAfterResponse = await database.query({
        text: `
          SELECT
            expires_at
          FROM
            sessions
          WHERE
            token = $1
          ;`,
        values: [createSessionBody.token],
      });

      const expiresAtAfterRenew = sessionAfterResponse.rows[0].expires_at;

      expect(expiresAtAfterRenew).toBeInstanceOf(Date);
      expect(expiresAtAfterRenew.getTime()).toBeGreaterThan(
        expiresAtBeforeRenew.getTime(),
      );
    });

    test("With session token not found in database", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: "session_id=token-does-not-exist",
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão não encontrada.",
        action: "Verifique se o token de sessão é válido e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session token", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "expiredsession",
            password: "senha123",
            email: "expiredsession@email.com",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const createSessionResponse = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "expiredsession@email.com",
            password: "senha123",
          }),
        },
      );

      expect(createSessionResponse.status).toBe(201);
      const createSessionBody = await createSessionResponse.json();

      await database.query({
        text: `
          UPDATE
            sessions
          SET
            expires_at = NOW() - INTERVAL '1 minute'
          WHERE
            token = $1
          ;`,
        values: [createSessionBody.token],
      });

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${createSessionBody.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Sessão expirada.",
        action: "Faça login novamente para obter uma nova sessão.",
        status_code: 401,
      });
    });
  });
});
