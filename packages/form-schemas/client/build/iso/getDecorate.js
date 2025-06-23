/**
 * returns function that decorates valid data for a form-schema with full option values and labels
 */

import update from 'immutability-helper';
import assign from 'lodash/assign.js';
import get from 'lodash/get.js';
import isArray from 'lodash/isArray.js';
import isObject from 'lodash/isObject.js';
import mapKeys from 'lodash/mapKeys.js';
import omit from 'lodash/omit.js';
import find from 'lodash/find.js';
import flattenLabels from '../lib/flatten.js';
const _ = {
  assign,
  get,
  isArray,
  isObject,
  mapKeys,
  omit,
  find
};
function _decorateOption(labelsAsValues, options, id) {
  const option = options.find(o => o.id === id);
  const decoratedOption = typeof option === 'undefined' || option === null ? null : _.omit(option, ['legacyId']);
  if (labelsAsValues && _.get(decoratedOption, 'label')) return decoratedOption.label;
  return decoratedOption;
}
function decorate(fields, data) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const {
    lang,
    labelsAsKeys,
    labelsAsValues,
    ignoreNonArrayObjects
  } = _.assign({
    lang: null,
    labelsAsKeys: false,
    labelsAsValues: false,
    ignoreNonArrayObjects: false
  }, options);
  const changes = {};
  const cleanFields = fields.map(f => lang || labelsAsKeys ? flattenLabels(f, lang) : f);
  cleanFields.forEach(f => {
    if (!f.options) return;
    if (data[f.field] === undefined) return;
    if (_.isArray(data[f.field])) {
      changes[f.field] = {
        $set: data[f.field].map(_decorateOption.bind(null, labelsAsValues, f.options))
      };
    } else {
      changes[f.field] = {
        $set: _decorateOption(labelsAsValues, f.options, data[f.field])
      };
    }
  });
  let updatedValues = update(data, changes);
  if (ignoreNonArrayObjects) {
    updatedValues = _.omit(updatedValues, cleanFields.filter(f => !_.isArray(updatedValues[f.field]) && _.isObject(updatedValues[f.field])).map(f => f.field));
  }
  if (!labelsAsKeys) return updatedValues;
  return _.omit(_.mapKeys(updatedValues, (v, k) => _.get(_.find(cleanFields, {
    field: k
  }), 'label', '$remove')), ['$remove']);
}
export default fields => decorate.bind(null, fields);
export { decorate };
//# sourceMappingURL=getDecorate.js.map