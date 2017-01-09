import schema from 'validators/schema';

schema.register( {
  number: require( 'validators/number' )
} );

export default function validate( values ) {

  try {

    schema( {
      credentialType: {
        type: 'number',
        optional: false,
        min: 1,
        max: 4
      }
    } )( values );

  } catch ( e ) {

    return Object.assign( ...e.map( v => ({ [v.field]: v.code }) ) );

  }

  return true;

};
