import _get from "lodash/get.js";
import _find from "lodash/find.js";
import isSameFormItem from './isSameFormItem.js';
export default (schema, field) => {
  var _matching$type;
  const matching = _find(_get(schema, 'fields', []), sf => isSameFormItem(sf, field));
  if (((_matching$type = matching === null || matching === void 0 ? void 0 : matching.type) !== null && _matching$type !== void 0 ? _matching$type : 'field') === 'section') {
    return true;
  }
  return _get(matching, 'fieldType', 'abstract') !== 'abstract';
};
//# sourceMappingURL=isOwnField.js.map