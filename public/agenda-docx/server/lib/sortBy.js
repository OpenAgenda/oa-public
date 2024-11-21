import _ from 'lodash';
import stableSort from './stableSort.js';
import isNumber from './isNumber.js';

const defaultGetValue = _.get;

export default (array, keys, getValue = defaultGetValue) => {
  let result = array;

  (Array.isArray(keys) ? keys : [keys]).reverse().forEach((sortByKey) => {
    result = stableSort(result, (a, b) => {
      const valA = getValue(a, sortByKey);
      const valB = getValue(b, sortByKey);

      if (isNumber(valA) && isNumber(valB)) {
        return valA - valB;
      }

      return new Intl.Collator('fr', { numeric: true }).compare(valA, valB);
    });
  });

  return result;
};
