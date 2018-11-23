import _ from 'lodash';

export default ( field, values ) => {

  if ( !field.related.length ) return {};

  return _.pick( values, [].concat( field.related ) );

}
