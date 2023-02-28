import isMatch from 'lodash/isMatch';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

export default function matchQuery(a, b) {
  return isMatch(omitBy(a, isEmpty), omitBy(b, isEmpty));
}
