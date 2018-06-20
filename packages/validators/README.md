#Overview

configurable validators that couple up validation with data sanitizing. A configured validator throws errors in arrays in case of invalid data and return sanitized value when the input is valid.


## Running the tests

Run:

    npm test


# Validating a single value

Load all validators by requiring service, or just specific validator by calling the corresponding file, then validate by field type. Example:

    var validators = require( 'validators' );
    // or emailValidator = require( 'validators/email' );

    var validateEmail = validators.email( { field: 'userEmail' });
    // or var validateEmail = emailValidator( ... );

    try {

      validateEmail( 'fdsfdsq' );

    } catch( e ) {

      // e will look like this:
      [ {
        field: 'userEmail',
        code: 'email.invalid',
        message: 'email is not valid',
        origin: 'fdsfdsq'
      } ]

    }

If the tested value is valid, sanitized value is returned


# Validating a form - a set of values

Values from an entire form can be validated in one go by using the collection helper. It will evaluate all values before throwing an array of errors if any
error arises, or return an array of { field: , value: } pairs if no error was found. Give it the definition of each validator in an array

    var setValidator = require( 'validators/set' ),

    email = require( 'validators/email' ),

    text = require( 'validators/text' ),

    phone = require( 'validators/phone' ),

    // load validation functions
    validateSet = setValidator( [
      text( {
        field: 'name',
        min: 3,
        max: 40
      } ),
      email( {
        field: 'user_email'
      } ),
      phone( {
        field: 'user_phone'
      } )
    ] );

    // and it is ready to take in data, by field/value attribute pairs

    try {

      validateSet( [ {
        field: 'name',
        value: 'Toto'
      }, {
        field: 'user_email',
        value: 'fdssq'
      }, {
        field: 'user_phone',
        value: '06 37 93 02 01'
      } ] );

    } catch ( e ) {
  
      // e should be an array with the user email here

    }