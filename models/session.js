import database from "infra/database.js";
import crypto from "node:crypto";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRATION_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function createSessionForUser(userId) {
  const token = await newToken(userId);

  return token;
}

async function getSessionById(sessionId) {
  const session = await getSession(sessionId);

  return session;
}

async function newToken(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const results = await database.query({
    text: `
        INSERT INTO 
            sessions (token, user_id, expires_at) 
        VALUES 
            ($1, $2, $3)
        RETURNING
          *
        ;`,
    values: [token, userId, expiresAt],
  });

  return results.rows[0];
}

async function getSession(sessionId) {
  const results = await database.query({
    text: `
        SELECT 
            *
        FROM 
            sessions
        WHERE
            token = $1
        ;`,
    values: [sessionId],
  });

  if (results.rowCount === 0) {
    throw new UnauthorizedError({
      message: `Sessão não encontrada.`,
      action: `Verifique se o token de sessão é válido e tente novamente.`,
    });
  }

  if (results.rows[0].expires_at < new Date()) {
    throw new UnauthorizedError({
      message: `Sessão expirada.`,
      action: `Faça login novamente para obter uma nova sessão.`,
    });
  }

  return results.rows[0];
}

async function renewSession(sessionId) {
  const newExpiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const results = await database.query({
    text: `
        UPDATE
            sessions
        SET
            expires_at = $1,
            updated_at = timezone ('utc', now())
        WHERE
            token = $2
        RETURNING
          *
        ;`,
    values: [newExpiresAt, sessionId],
  });

  if (results.rowCount === 0) {
    throw new UnauthorizedError({
      message: `Sessão não encontrada para renovação.`,
      action: `Verifique se o token de sessão é válido e tente novamente.`,
    });
  }

  return results.rows[0];
}

const session = {
  createSessionForUser,
  getSessionById,
  renewSession,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
