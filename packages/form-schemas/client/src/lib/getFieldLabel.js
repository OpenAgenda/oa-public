import _ from 'lodash';

export default ( field, key, preferredLang ) => {

  const label = _.get( field, key, null );

  if ( !label || _.isString( label ) ) return label;

  return _.get( label, preferredLang, label[ _.first( _.keys( label ) ) ] );

}
