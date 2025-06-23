import _isArray from "lodash/isArray.js";
import _assign from "lodash/assign.js";
// its all about having options

export default validatorOptions => optionValues => {
  const {
    optional,
    field
  } = _assign({
    optional: true,
    field: null
  }, validatorOptions || {});
  if (!optional && (!_isArray(optionValues) || !optionValues.length)) {
    // eslint-disable-next-line no-throw-literal
    throw [_assign({
      code: 'options.empty',
      message: 'option list cannot be empty',
      origin: optionValues
    }, field ? {
      field
    } : {})];
  }
  return optionValues;
};
//# sourceMappingURL=optionsValidator.js.map