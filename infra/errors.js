export class InternalServerError extends Error {
  constructor({ cause, status_code, message, action, name }) {
    super(message || "Um erro interno não esperado aconteceu", {
      cause,
    });

    this.name = name || "InternalServerError";
    this.action = action || "Se preciso fale com o suporte";
    this.status_code = status_code || 500;
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

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Serviço indisponivel no momento", {
      cause,
    });

    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponivel";
    this.status_code = 503;
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

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Um erro de validação ocorreu", {
      cause,
    });

    this.name = "ValidationError";
    this.action = action || "Ajuste os dados enviados e tente novamente";
    this.status_code = 400;
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

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Conteudo não foi encontrado", {
      cause,
    });

    this.name = "NotFoundError";
    this.action = action || "Dados de busca errados ou conteudo não existe";
    this.status_code = 404;
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
