import { Client } from "pg";
import { ServiceError } from "./errors";

async function query(queryObject) {
  let client;
  try {
    client = await createDbClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      cause: error,
      message: "Erro de conexão com o banco ou na query",
    });
    throw serviceErrorObject;
  } finally {
    await client?.end();
  }
}

async function createDbClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  await client.connect();

  return client;
}

export default {
  query,
  createDbClient,
};
