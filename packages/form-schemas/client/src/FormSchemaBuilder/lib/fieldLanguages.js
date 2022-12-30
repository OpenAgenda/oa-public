import _ from 'lodash';

export default (field, lang) => {
  if (_.isString(field.label)) {
    return lang ? [lang] : [];
  }

  return _.keys(field.label);
};
