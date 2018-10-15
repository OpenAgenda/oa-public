#Overview

configurable validators that couple up validation with data sanitizing. A configured validator throws errors in arrays in case of invalid data and return sanitized value when the input is valid.

## INstallation

    yarn

## Running the tests

    yarn test


# Basic validation

Each function returns a configured validate fonction. The following initializes a simple email validate fonction that doubles as a sanitizer:

    const emailValidator = require( '@openagenda/validators/email' );

    const validate = emailValidators();

    // returns my@email.com
    const cleanEmail = validate( 'my@email.com' );


# Schema validation

A schema is composed of validators. These need to be registered ( loaded ) before they can be used through a 'register' function.

Defining a schema consists in dispatching each validator configuration in an object representing the schema.

    const schema = require( '@openagenda/validators/schema' );

    schema.register( {
      text: require( '@openagenda/validators/text' ),
      email: require( '@openagenda/validators/email' )
    } );

    const mySchema = schema( {
      name: {
        type: 'text'
      },
      email {
        type: 'email'
      }
    } );

    const clean = schema( {
      name: 'Gaetan',
      email: 'support@openagenda.com'
    } );


## Enabling fields based on submitted values

The validation of a field in the schema can be conditioned by the validation of another field in the schema. For example, if your object to be validated has an image and a image credit, the image credit is useful only when the image field is defined

    const images = schema( {
      name: {
        type: 
      },
      image: {
        type: 'text'
      },
      credits: {
        type: 'text',
        optional: false,
        enableWith: 'image'
      }
    } );

    // { name: 'Gaetan', image: null, credits: null }
    const without = images( {
      name: 'Gaetan',
      credits: 'There is something here anyways'
    } );

    // { name: 'Gaetan', image: 'image.png', credits: 'This is validated' }
    const with = image( {
      name: 'Gaetan',
      image: 'image.png',
      credits: 'This is validated'
    } );

    try {

      image( {
        name: 'Gaetan',
        image: 'image.png'
      } )

    } catch ( errors ) {

      // this will crash as image is specified and enabled credits is not optional

    }



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

      validateSet( [ {
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
