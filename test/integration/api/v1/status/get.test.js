test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  const respondeBody = await response.json();

  expect(response.status).toBe(200);

  expect(respondeBody.updated_At).toEqual(
    new Date(respondeBody.updated_At).toISOString(),
  );

  expect(respondeBody.dependencies.database.version).toBeDefined();
  expect(respondeBody.dependencies.database.count_Db_Connections).toBe(1);
  expect(respondeBody.dependencies.database.max_Db_Connections).toBeDefined();

  console.log(respondeBody);
});
