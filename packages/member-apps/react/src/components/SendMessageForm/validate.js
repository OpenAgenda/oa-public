import schema from 'validators/schema';

schema.register( {
  text: require( 'validators/text' )
} );

export default function validate( values ) {

  let errors = {};

  try {

    schema( {
      message: {
        type: 'text',
        optional: false
      }
    } )( values );

  } catch ( e ) {

    Object.assign( errors, ...e.map( v => ({ [v.field]: v.code }) ) );

  }

  if ( Object.keys( errors ).length ) {
    return errors;
  }

  return true;

};
