import schema from '@openagenda/validators/schema';

schema.register( {
  text: require( '@openagenda/validators/text' ),
  email: require( '@openagenda/validators/email' )
} );

export default function validate( values ) {

  let errors = {};

  try {

    schema( {
      message: {
        type: 'text',
        optional: false
      },
      replyTo: {
        type: 'email',
        optional: true
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
