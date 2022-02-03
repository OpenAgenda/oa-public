import _ from 'lodash';

export default function matchQuery(a, b) {
  return _.isMatch(_.omitBy(a, _.isEmpty), _.omitBy(b, _.isEmpty));
}
