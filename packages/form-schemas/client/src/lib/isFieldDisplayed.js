import _ from 'lodash';

export default ( role, field ) => {

  if ( !_isWithinRole( role, field ) ) return false;

  return field.display;

}

function _isWithinRole( role, field ) {

  if ( !_.isArray( field.write ) ) return true;

  if ( field.write.includes( role ) ) return true;

  return field.write.includes( role );

}
