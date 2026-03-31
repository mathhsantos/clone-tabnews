import database from "infra/database";
import password from "models/password";
import { NotFoundError, ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;
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
      userInputValues?.username?.toLowerCase(),
      userInputValues?.email?.toLowerCase(),
      await password.hash(userInputValues.password),
    ],
  });

  return results.rows[0];
}

async function update(username, userInputValues) {
  const foundUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  const userWithUpdatedValues = {
    ...foundUser,
    ...userInputValues,
  };

  const userUpdated = await runUpdateQuery(userWithUpdatedValues);

  return userUpdated;
}

async function runUpdateQuery(userWithUpdatedValues) {
  const results = await database.query({
    text: `
      UPDATE 
        users 
      SET
        username = $1,
        email = $2,
        password = $3,
        updated_at = timezone ('utc', now())
      WHERE
        id = $4
        RETURNING
          *
        ;`,
    values: [
      userWithUpdatedValues.username?.toLowerCase(),
      userWithUpdatedValues.email?.toLowerCase(),
      userWithUpdatedValues.password
        ? await password.hash(userWithUpdatedValues.password)
        : userWithUpdatedValues.password,
      userWithUpdatedValues.id,
    ],
  });

  return results.rows[0];
}

async function findOneByUsername(userInputValues) {
  const userFound = await findOne("username", userInputValues);

  return userFound;
}

async function findOneByEmail(userInputValues) {
  const userFound = await findOne("email", userInputValues);

  return userFound;
}

async function findOne(column, value) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        ${column} = $1
      LIMIT
        1
      ;`,
    values: [value],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: `Usuario com ${column}: ${value} não encontrado.`,
      action: `Utilize outro ${column} para continuar com esta operação.`,
    });
  }

  return result.rows[0];
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
    values: [email?.toLowerCase()],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
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
    values: [username?.toLowerCase()],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }

  return;
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
