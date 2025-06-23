import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
const dispatchDataPerSchemas = (data, schemas) => {
  const dispatchedValues = schemas.map(schema => {
    const currentFields = schema.fields.filter(field => field.fieldType !== 'abstract').map(e => e.field);
    const currentValues = _reduceInstanceProperty(currentFields).call(currentFields, (prev, curr) => {
      if (data[curr]) return _objectSpread(_objectSpread({}, prev), {}, {
        [curr]: data[curr]
      });
      return prev;
    }, {});
    return currentValues;
  });
  return dispatchedValues;
};
export default dispatchDataPerSchemas;
//# sourceMappingURL=dispatchDataPerSchemas.js.map