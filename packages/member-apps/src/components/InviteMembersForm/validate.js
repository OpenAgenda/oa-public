import schema from '@openagenda/validators/schema';

schema.register( {
  number: require( '@openagenda/validators/number' ),
  email: require( '@openagenda/validators/email' )
} );

export default function validate( values ) {

  let errors = {};

  values = { ...values };
  values.emails = values.emails && values.emails.split( /[\s\n,]+/ ).map( v => v.trim() ).filter( v => !!v );

  try {
    schema( {
      role: {
        type: 'number',
        optional: false,
        min: 1,
        max: 4
      },
      emails: {
        type: 'email',
        optional: false,
        list: true
      }
    } )( values );
  } catch ( e ) {

    Object.assign( errors, ...e.map( v => ({ [v.field]: v.code }) ) );

  }

  if ( errors.emails && values.emails && values.emails.length > 1 ) {

    errors.emails = 'emails.invalid'

  }

  if ( Object.keys( errors ).length ) {
    return errors;
  }

  return true;

};
