import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("PUT to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "PUT",
      });

      const responsebody = await response.json();

      expect(responsebody).toEqual({
        name: "MethodNotAllowedError",
        message: "Um erro interno não esperado aconteceu",
        action:
          "Verifique se o método HTTP enviado é valido para esse endpoint",
        status_code: 405,
      });
    });
  });
});
