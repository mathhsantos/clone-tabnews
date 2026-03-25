import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = process.env.NODE_ENV === "production" ? 14 : 1;

  console.log(password, process.env.PAPPER_KEY);

  return await bcryptjs.hash(password + process.env.PAPPER_KEY, rounds);
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(
    providedPassword + process.env.PAPPER_KEY,
    storedPassword,
  );
}

const password = {
  hash,
  compare,
};

export default password;
