import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/esnext.set.add-all.js";
import "core-js/modules/esnext.set.delete-all.js";
import "core-js/modules/esnext.set.difference.js";
import "core-js/modules/esnext.set.every.js";
import "core-js/modules/esnext.set.filter.js";
import "core-js/modules/esnext.set.find.js";
import "core-js/modules/esnext.set.intersection.js";
import "core-js/modules/esnext.set.is-disjoint-from.js";
import "core-js/modules/esnext.set.is-subset-of.js";
import "core-js/modules/esnext.set.is-superset-of.js";
import "core-js/modules/esnext.set.join.js";
import "core-js/modules/esnext.set.map.js";
import "core-js/modules/esnext.set.reduce.js";
import "core-js/modules/esnext.set.some.js";
import "core-js/modules/esnext.set.symmetric-difference.js";
import "core-js/modules/esnext.set.union.js";
import "core-js/modules/web.dom-collections.iterator.js";
import schema from '@openagenda/validators/schema/index.js';
import textValidator from '@openagenda/validators/text.js';
import linkValidator from '@openagenda/validators/link.js';
const requiredError = function () {
  let field = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  return [{
    code: 'required',
    message: 'A value is required',
    field
  }];
};
schema.register({
  text: textValidator,
  link: linkValidator
});
const baseFields = {
  extension: {
    type: 'text'
  },
  originalName: {
    type: 'text'
  },
  filename: {
    type: 'text'
  }
};
function isEmptyObject(obj) {
  let visited = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();
  if (obj === null || typeof obj === 'undefined') {
    return true;
  }
  if (Array.isArray(obj) && obj.length === 0) {
    return true;
  }
  if (typeof obj === 'object' && Object.keys(obj).length === 0) {
    return true;
  }
  if (typeof obj !== 'object') {
    return !obj;
  }
  if (visited.has(obj)) {
    return true;
  }
  visited.add(obj);
  for (const key in obj) {
    if (!isEmptyObject(obj[key], visited)) {
      return false;
    }
  }
  return true;
}
export default (function () {
  let validatorOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return v => {
    const optional = (validatorOptions === null || validatorOptions === void 0 ? void 0 : validatorOptions.optional) === undefined ? true : validatorOptions === null || validatorOptions === void 0 ? void 0 : validatorOptions.optional;
    if (!optional && !v) {
      throw requiredError(validatorOptions === null || validatorOptions === void 0 ? void 0 : validatorOptions.field);
    }
    if (!v) {
      return null;
    }
    const fields = _objectSpread({}, baseFields);
    if (validatorOptions !== null && validatorOptions !== void 0 && validatorOptions.allowPath && v !== null && v !== void 0 && v.path) {
      fields.path = {
        type: 'text'
      };
    } else if (validatorOptions !== null && validatorOptions !== void 0 && validatorOptions.allowURL && v !== null && v !== void 0 && v.url) {
      fields.url = {
        type: 'link'
      };
    }
    if (validatorOptions !== null && validatorOptions !== void 0 && validatorOptions.imageWithSizeAndVariants) {
      fields.size = {
        width: {
          type: 'integer',
          default: null
        },
        height: {
          type: 'integer',
          default: null
        }
      };
      fields.variants = {
        list: true,
        fields: {
          type: {
            type: 'text'
          },
          filename: {
            type: 'text'
          },
          size: _objectSpread({}, fields.size)
        }
      };
    }
    const clean = schema(fields)(v);
    if (isEmptyObject(clean)) {
      return null;
    }
    return clean;
  };
});
//# sourceMappingURL=fileValidator.js.map