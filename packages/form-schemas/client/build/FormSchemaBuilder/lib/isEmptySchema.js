import _get from "lodash/get.js";
/**
 * if there are no fields then it's empty.
 */
export default schema => !_get(schema, 'fields', []).length;
//# sourceMappingURL=isEmptySchema.js.map