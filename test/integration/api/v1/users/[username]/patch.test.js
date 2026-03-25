import orchestrator from "test/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With existing user", async () => {
      const createUserResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "existinguser",
          password: "senha123",
          email: "existinguser@email.com",
        }),
      });

      expect(createUserResponse.status).toBe(201);

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/existinguser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "updateduser",
            password: "novasenha123",
            email: "updateduser@email.com",
          }),
        },
      );

      expect(patchResponse.status).toBe(200);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        id: patchResponseBody.id,
        username: "updateduser",
        email: "updateduser@email.com",
        password: patchResponseBody.password,
        created_at: patchResponseBody.created_at,
        updated_at: patchResponseBody.updated_at,
      });

      expect(uuidVersion(patchResponseBody.id)).toBe(4);
      expect(Date.parse(patchResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(patchResponseBody.updated_at)).not.toBeNaN();
    });

    test("With non-existent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "anotherusername",
            password: "senha123",
            email: "another@email.com",
          }),
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Username nonexistentuser não encontrado",
        action: "Utilize outro username para realizar a busca.",
        status_code: 404,
      });
    });

    test("With duplicated email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailowner",
          password: "senha123",
          email: "emailowner@email.com",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailupdateuser",
          password: "senha123",
          email: "emailupdateuser@email.com",
        }),
      });

      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/emailupdateuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "emailupdateuser2",
            password: "senha123",
            email: "Emailowner@email.com",
          }),
        },
      );

      expect(response3.status).toBe(400);

      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With duplicated username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameowner",
          password: "senha123",
          email: "usernameowner@email.com",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameupdateuser",
          password: "senha123",
          email: "usernameupdateuser@email.com",
        }),
      });

      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/usernameupdateuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "Usernameowner",
            password: "senha123",
            email: "newusernameupdateuser@email.com",
          }),
        },
      );

      expect(response3.status).toBe(400);

      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
        status_code: 400,
      });
    });
  });
});
