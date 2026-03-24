import database from "infra/database";
import password from "models/password";
import { NotFoundError, ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;
}

async function findOneByUsername(userInputValues) {
  const userFound = await findOne(userInputValues);

  return userFound;
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
      SELECT 
        email 
      FROM 
        users 
      WHERE 
        email = $1
      ;`,
    values: [email.toLowerCase()],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar o cadastro.",
    });
  }

  return;
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `
      SELECT 
        username 
      FROM 
        users 
      WHERE 
        username = $1
      ;`,
    values: [username.toLowerCase()],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar o cadastro.",
    });
  }

  return;
}

async function runInsertQuery(userInputValues) {
  const results = await database.query({
    text: `
      INSERT INTO 
        users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        ;`,
    values: [
      userInputValues.username.toLowerCase(),
      userInputValues.email.toLowerCase(),
      await password.hash(userInputValues.password),
    ],
  });

  return results.rows[0];
}

async function findOne(username) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        username = $1
      LIMIT
        1
      ;`,
    values: [username],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: `Username ${username} não encontrado`,
      action: "Utilize outro username para realizar a busca.",
    });
  }

  return result.rows[0];
}

const user = {
  create,
  findOneByUsername,
};

export default user;
