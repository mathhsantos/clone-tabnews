export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um erro interno não esperado aconteceu", {
      cause,
    });

    this.name = "InternalServerError";
    this.action = "Um erro interno não esperado aconteceu";
    this.status_code = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Um erro interno não esperado aconteceu");

    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é valido para esse endpoint";
    this.status_code = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.status_code,
    };
  }
}
