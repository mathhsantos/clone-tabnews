import { Client } from "pg";

async function query(queryObject) {
  let client = await createDbClient();

  try {
    const result = await client.query(queryObject);
    return result;
  } catch {
    console.log("Erro de conexão com o banco");
  } finally {
    await client.end();
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
