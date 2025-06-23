var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/updateCustomFilter.js
var updateCustomFilter_exports = {};
__export(updateCustomFilter_exports, {
  default: () => updateCustomFilter
});
module.exports = __toCommonJS(updateCustomFilter_exports);
function updateCustomFilter(filter, active) {
  const activeClass = filter.activeClass || "active";
  const inactiveClass = filter.inactiveClass || "inactive";
  const { classList } = filter.activeTargetElem || filter.elem;
  const handlerElem = filter.handlerElem || filter.elem;
  const innerCheckboxes = handlerElem.querySelectorAll(
    'input[type="checkbox"]'
  );
  const checkbox = innerCheckboxes.length === 1 ? innerCheckboxes[0] : null;
  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
    if (checkbox && !checkbox.checked) checkbox.checked = true;
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
    if (checkbox && checkbox.checked) checkbox.checked = false;
  }
}
//# sourceMappingURL=updateCustomFilter.cjs.map