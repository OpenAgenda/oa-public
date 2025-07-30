'use strict';

// enhanced VError.prototype.toJSON
module.exports = function errorToJSON(error, stackDelim) {
  const obj = {
    name: error.name || 'Error',
    message: error.message,
    shortMessage: undefined, // to keep order
    stack: undefined, // to keep order
  };

  Object.assign(obj, error);

  if (error.shortMessage) {
    obj.shortMessage = error.shortMessage;
  }

  obj.stack = stackDelim ? error.stack?.split(stackDelim) : error.stack;

  if (error.cause) {
    obj.cause = errorToJSON(error.cause);
  }

  if (error.info) {
    obj.info = error.info;
  }

  // Conserve keys order in obj
  for (const key in error['@@verror/meta']) {
    if (
      Object.prototype.hasOwnProperty.call(error['@@verror/meta'], key)
      && !(key in obj)
    ) {
      obj[key] = error['@@verror/meta'][key];
    }
  }

  return obj;
};
