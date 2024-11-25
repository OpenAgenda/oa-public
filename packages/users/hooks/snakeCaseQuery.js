import _ from 'lodash';
import deeply from '../utils/deeply.js';

export default function snakeCaseQuery() {
  return (context) =>
    _.set(
      context,
      'params.query',
      deeply(_.mapKeys)(_.get(context, 'params.query', {}), (value, key) =>
        (_.startsWith(key, '$') ? key : _.snakeCase(key))),
    );
}
