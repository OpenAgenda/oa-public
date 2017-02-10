import schema from 'validators/schema';

schema.register( {
  number: require( 'validators/number' ),
  email: require( 'validators/email' )
} );

export default function validate( values ) {

  let errors = {};

  values = { ...values };
  values.emails = values.emails && values.emails.split( ',' ).map( v => v.trim() ).filter( v => !!v );

  try {

    // TODO limit to possible credentials

    schema( {
      credential: {
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

  console.log( values );

  if ( Object.keys( errors ).length ) {
    return errors;
  }

  return true;

};
