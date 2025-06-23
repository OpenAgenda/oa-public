import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/es.string.replace.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
export default (labels, field, error) => {
  var _context;
  const {
    code,
    message
  } = error;
  const matchingLabel = labels[code];
  if (!matchingLabel) return message;
  return _reduceInstanceProperty(_context = Object.keys(field).filter(fieldKey => {
    var _context2;
    return _includesInstanceProperty(_context2 = ['min', 'max']).call(_context2, fieldKey);
  })).call(_context, (rendered, fieldKey) => rendered.replace("%".concat(fieldKey, "%"), field[fieldKey]), matchingLabel);
};
//# sourceMappingURL=getErrorLabel.js.map