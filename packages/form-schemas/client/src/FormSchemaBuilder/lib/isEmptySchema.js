import _ from 'lodash';

/**
 * if there are no fields then it's empty.
 */
export default schema => {
  return !_.get( schema, 'fields', [] ).length;
}
