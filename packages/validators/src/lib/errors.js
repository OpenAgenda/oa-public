export default (params, value, code, message) => [({
  origin: value,
  code,
  message,
  ...(params.field ? { field: params.field } : {})
})];