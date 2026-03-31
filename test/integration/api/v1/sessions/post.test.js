import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect email but correct password", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "incorrectemailuser",
          password: "correctpassword",
          email: "incorrectemailuser@email.com",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrectemailuser2@email.com",
          password: "correctpassword",
        }),
      });

      expect(response2.status).toBe(401);

      const responsebody = await response2.json();

      expect(responsebody).toEqual({
        name: "UnauthorizedError",
        message: "Credenciais incorretas",
        action: "Verifique as credenciais e tente novamente.",
        status_code: 401,
      });
    });

    test("With incorrect password but correct email", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "incorrectpassworduser",
          password: "correctpassword",
          email: "incorrectpassworduser@email.com",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrectpassworduser@email.com",
          password: "incorrectpassword",
        }),
      });

      expect(response2.status).toBe(401);

      const responsebody = await response2.json();

      expect(responsebody).toEqual({
        name: "UnauthorizedError",
        message: "Credenciais incorretas",
        action: "Verifique as credenciais e tente novamente.",
        status_code: 401,
      });
    });

    test("With incorrect email and password", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "incorrectcredentialsuser",
          password: "correctpassword",
          email: "incorrectcredentialsuser@email.com",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrectcredentialsuseremail@email.com",
          password: "incorrectpassword",
        }),
      });

      expect(response2.status).toBe(401);

      const responsebody = await response2.json();

      expect(responsebody).toEqual({
        name: "UnauthorizedError",
        message: "Credenciais incorretas",
        action: "Verifique as credenciais e tente novamente.",
        status_code: 401,
      });
    });

    test("With correct email and password", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "correctcredentialsuser",
          password: "correctpassword",
          email: "correctcredentialsuser@email.com",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correctcredentialsuser@email.com",
          password: "correctpassword",
        }),
      });

      expect(response2.status).toBe(201);
      const responsebody = await response.json();
      const response2body = await response2.json();
      const setCookieHeader = response2.headers.get("set-cookie");

      expect(response2body).toEqual({
        id: response2body.id,
        token: response2body.token,
        user_id: responsebody.id,
        expires_at: response2body.expires_at,
        created_at: response2body.created_at,
        updated_at: response2body.updated_at,
      });

      expect(setCookieHeader).toContain(`session_id=${response2body.token}`);
      expect(setCookieHeader).toContain("Path=/");
      expect(setCookieHeader).toContain("HttpOnly");
      expect(setCookieHeader).toContain("Max-Age=");
    });
  });
});
