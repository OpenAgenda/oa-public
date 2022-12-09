import _ from 'lodash';

/**
 * if there are no fields then it's empty.
 */
export default schema => !_.get(schema, 'fields', []).length;
