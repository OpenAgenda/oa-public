export default (params, value, code, message, ...args) => {
  const error = {
    origin: value,
    code,
    message,
  };

  if (params.field) {
    error.field = params.field;
  }

  if (args.length) {
    Object.assign.apply(null, [error].concat(args));
  }

  return [error];
};
