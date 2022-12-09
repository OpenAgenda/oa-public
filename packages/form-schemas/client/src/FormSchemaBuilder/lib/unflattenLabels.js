import _ from 'lodash';
import ih from 'immutability-helper';

import labelKeys from './labelKeys';

export default (field, languages) => ih(field, labelKeys
  .filter(labelKey => _.isString(_.get(field, labelKey)))
  .reduce((updates, f) => _.set(updates, f, {
    $set: languages.reduce((fieldValues, lang) => _.set(fieldValues, lang, field[f]), {}),
  }), {}));
