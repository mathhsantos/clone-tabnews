import user from "models/user.js";
import password from "models/password";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const authenticatedUser = await validateEmail(providedEmail);
    await validatePassword(providedPassword, authenticatedUser.password);

    return authenticatedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Credenciais incorretas",
        action: "Verifique as credenciais e tente novamente.",
      });
    }

    throw error;
  }
}

async function validateEmail(email) {
  let userFound;

  try {
    userFound = await user.findOneByEmail(email);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Credenciais incorretas",
        action: "Verifique as credenciais e tente novamente.",
      });
    }

    throw error;
  }

  return userFound;
}

async function validatePassword(providedPassword, storedUserPassword) {
  const passwordMatch = await password.compare(
    providedPassword,
    storedUserPassword,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError({
      message: "Credenciais incorretas",
      action: "Verifique as credenciais e tente novamente.",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
