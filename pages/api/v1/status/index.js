import database from "infra/database.js";

export default async function status(request, response) {
  const countDbConnections = await database.query(
    "SELECT count(*)::int FROM pg_stat_activity WHERE datname = 'local_db';",
  );

  const dbVersion = await database.query("SELECT version();");

  const maxDbConnections = await database.query("SHOW max_connections;");

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_At: updatedAt,
    dependencies: {
      database: {
        version: dbVersion.rows[0].version.slice(0, 15),
        count_Db_Connections: countDbConnections.rows[0].count,
        max_Db_Connections: parseInt(maxDbConnections.rows[0].max_connections),
      },
    },
  });
}
