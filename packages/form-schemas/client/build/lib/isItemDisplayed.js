import _isArray from "lodash/isArray.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
function isWithinRole(role, value) {
  if (!_isArray(value)) return true;
  if (_includesInstanceProperty(value).call(value, role)) return true;
  return _includesInstanceProperty(value).call(value, role);
}
export default (role, item) => {
  if (item.type && item.type !== 'field') {
    return true;
  }
  if (!isWithinRole(role, item.write)) return false;
  if (Array.isArray(item.display)) {
    return isWithinRole(role, item.display);
  }
  return item.display;
};
//# sourceMappingURL=isItemDisplayed.js.map