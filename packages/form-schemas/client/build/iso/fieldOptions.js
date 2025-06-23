import _get from "lodash/get.js";
import _flatten from "lodash/flatten.js";
import _uniq from "lodash/uniq.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
const fieldHasUnnassignedOptions = field => {
  var _field$options;
  return !!((_field$options = field === null || field === void 0 ? void 0 : field.options) !== null && _field$options !== void 0 ? _field$options : []).filter(o => o.id === undefined).length;
};
const fieldHasSuperiorOptions = (field, nextOptionId) => {
  var _field$options2;
  return !!((_field$options2 = field === null || field === void 0 ? void 0 : field.options) !== null && _field$options2 !== void 0 ? _field$options2 : []).filter(o => o.id > nextOptionId).length;
};
function fieldAssignOptionIds(field, nextOptionId) {
  let nextId = nextOptionId;
  field.options.forEach(o => {
    if (o.id !== undefined) {
      return;
    }
    nextId += 1;
    o.id = nextId;
  });
  return nextId;
}
function extractNextOptionId(formSchemaData) {
  var _formSchemaData$nextO;
  const definedNextOptionId = (_formSchemaData$nextO = formSchemaData === null || formSchemaData === void 0 ? void 0 : formSchemaData.nextOptionId) !== null && _formSchemaData$nextO !== void 0 ? _formSchemaData$nextO : 0;
  const optionIds = _uniq(_flatten(_get(formSchemaData, 'fields', []).filter(f => f.options).map(f => f.options)));
  const biggestId = _reduceInstanceProperty(optionIds).call(optionIds, (bId, optionId) => bId < optionId ? optionId : bId, 0);
  return definedNextOptionId > biggestId ? definedNextOptionId : biggestId + 1;
}
export { extractNextOptionId, fieldHasUnnassignedOptions, fieldAssignOptionIds, fieldHasSuperiorOptions };
//# sourceMappingURL=fieldOptions.js.map