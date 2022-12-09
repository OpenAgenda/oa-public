import _ from 'lodash';

export default (label, preferredLang) => {
  if (_.isString(label)) return label;

  return _.get(label, preferredLang, _.get(label, _.first(_.keys(label))));
};
