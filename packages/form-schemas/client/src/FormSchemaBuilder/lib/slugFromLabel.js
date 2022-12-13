import _ from 'lodash';
import slug from 'slugify';
import uuid from 'uuid/v4';

export default (label, preferredLang) => {
  const str = _.isString(label) ? label : _.get(label, preferredLang, _.get(label, _.first(_.keys(label))));

  if (!str?.length) {
    return uuid().replace(/-/g, '').substr(0, 12);
  }

  return slug(str, { lower: true, strict: true });
};
