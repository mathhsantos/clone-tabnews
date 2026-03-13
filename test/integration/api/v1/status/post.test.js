import orchestrator from "test/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });

      expect(response.status).toBe(405);

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
