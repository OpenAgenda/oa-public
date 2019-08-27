import validate from '@openagenda/members/build/validate';

const validateCustom = validate.custom( false );

export default function( values ) {
  try {
    validateCustom( values );
  } catch ( e ) {
    return flatErrors( e );
  }
  return true;
}

function flatErrors( e ) {
  return e.reduce( ( prev, next ) => ({ ...prev, [next.field]: next.code }), {} );
}
