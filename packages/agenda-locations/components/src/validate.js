"use strict"

const validators = {
  groupTags: require( '@openagenda/react-form-components/validators/groupTags' ),
  set: require( '@openagenda/validators/set' ),
  text: require( '@openagenda/validators/text' ),
  link: require( '@openagenda/validators/link' ),
  phone: require( '@openagenda/validators/phone' ),
  email: require( '@openagenda/validators/email' ),
  timezone: require( '@openagenda/validators/text' ),
  list: require( '@openagenda/validators/list' ),
  number: require( '@openagenda/validators/number' ),
  latitude: require( '@openagenda/validators/latitude' ),
  longitude: require( '@openagenda/validators/longitude' ),
  pass: require( '@openagenda/validators/pass' ),
  multilingual: require( '@openagenda/validators/multilingual' ),
  regex: require( '@openagenda/validators/regex' )
};

const STATES = {
  tocontrol: 0,
  validated: 1
};

const utils = require( '@openagenda/utils' );

// validators applying for all locations of all agendas
const baseValidators = [
  validators.number( { field: 'agendaId', optional: true } ),
  _customImageValidator( { field: 'image', optional: true } ),
  validators.text( { field: 'name', min: 3, max: 100, optional: false } ),
  validators.regex( { field: 'image', regex: /[^\/]+$/, clean: true, optional: true } ),
  validators.text( { field: 'imageCredits', max: 255, optional: true } ),
  validators.text( { field: 'address', min: 3, max: 255 } ),
  validators.text( { field: 'city', min: 2, max: 300, optional: true } ),
  validators.text( { field: 'district', optional: true } ),
  validators.text( { field: 'department', min: 3, max: 300, optional: true } ),
  validators.text( { field: 'region', min: 0, max: 300, optional: true } ),
  validators.text( { field: 'postalCode', min: 3, max: 20, optional: true } ),
  validators.text( { field: 'insee', min: 3, max: 20, optional: true } ),
  validators.text( { field: 'countryCode', min: 2, max: 2, optional: false } ),
  validators.text( { field: 'eveId', min: 0, max: 42, optional: true } ),
  validators.multilingual( { field: 'description', max: 5000, optional: true, defaultLanguage: 'fr' } ),
  validators.multilingual( { field: 'access', max: 1000, optional: true, defaultLanguage: 'fr' } ),
  validators.link( { field: 'website', min: 0, optional: true } ),
  validators.email( { field: 'email', min: 0, optional: true } ),
  validators.text( { field: 'extId', min: 0, max: 255, optional: true } ),
  validators.text( { field: 'timezone', min: 0, optional: true } ),
  validators.phone( { field: 'phone', min: 0, max: 42, optional: true } ),
  validators.latitude( { field: 'latitude', optional: true } ),
  validators.longitude( { field: 'longitude', optional: true } ),
  validators.number( { field: 'state', min: STATES.tocontrol, max: STATES.validated, default: STATES.validated } ),
  validators.list( { field: 'links', optional: true }, [
    validators.link()
  ] ),

  // suggestions are validated individually as partial locations
  validators.pass( { field: 'suggestions' } )
];


module.exports = utils.extend( validate, { field } );



function validate( data, settings, partial ) {

  let locationValidators = [];

  // clean arguments

  if ( arguments.length === 2 && typeof settings === 'boolean' ) {

    partial = settings;
    settings = {};

  } else if ( arguments.length === 1 ) {

    settings = {};

  }

  if ( !settings ) settings = {};


  // establish validators depending on settings

  if ( partial ) {

    locationValidators = _getValidators( settings ).filter( function( v ) {

      return Object.keys( data ).indexOf( v.field ) !== -1;

    } );

  } else {

    locationValidators = _getValidators( settings );

  }

  return validators.set( locationValidators, { compact: true } )( Object.keys( data ).map( function( k ) {

    return {
      field: k,
      value: data[ k ]
    }

  } ) );

}


/**
 * extract one validator from list
 */

function field( name ) {

  return baseValidators.filter( function( v ) {

    return v.field === name;

  } )[ 0 ];

}


/**
 * establish full list of location validators
 * based on settings
 */

function _getValidators( settings ) {

  const locationValidators = baseValidators.concat( [] );

  if ( settings.forceTags ) {

    locationValidators.push( validators.pass( { field: 'tags' } ) );

  } else if ( settings.tagSet ) {

    locationValidators.push( validators.groupTags( utils.extend( { field: 'tags' }, settings.tagSet ) ) )

  }

  return locationValidators;

}

function _customImageValidator( options ) {

  const v = validators.text( options );

  return utils.extend(imageValidate, {
    field: options.field,
    type: 'text'
  } );

  function imageValidate( value ) {

    const clean = v( value );

    if ( !clean ) return null;

    return clean.split( '/' ).pop();

  }

}
