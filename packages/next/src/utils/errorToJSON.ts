export interface JsonError {
  name: string
  message: string
  shortMessage?: string
  stack?: string
  cause?: JsonError
  info?: Record<string, any>
}

// enhanced VError.prototype.toJSON for dev
export function errorToJSON(error): JsonError {
  const obj: JsonError = {
    name: error.name,
    message: error.message,
  };

  if (error.shortMessage) {
    obj.shortMessage = error.shortMessage;
  }

  if (process.env.NODE_ENV) {
    obj.stack = error.stack;
  }

  if (error.cause) {
    obj.cause = errorToJSON(error.cause);
  }

  if (error.info) {
    obj.info = error.info;
  }

  // Conserve keys order in obj
  for (const key in error['@@verror/meta']) {
    if (Object.prototype.hasOwnProperty.call(error['@@verror/meta'], key) && !(key in obj)) {
      obj[key] = error['@@verror/meta'][key];
    }
  }

  return obj;
}
