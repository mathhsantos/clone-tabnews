import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;
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
      userInputValues.password,
    ],
  });

  return results.rows[0];
}

const user = {
  create,
};

export default user;
