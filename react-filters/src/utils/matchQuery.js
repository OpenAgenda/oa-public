import isMatch from 'lodash/isMatch.js';
import omitBy from 'lodash/omitBy.js';
import isEmpty from 'lodash/isEmpty.js';

export default function matchQuery(a, b) {
  return isMatch(omitBy(a, isEmpty), omitBy(b, isEmpty));
}
