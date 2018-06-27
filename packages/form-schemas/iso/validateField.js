"use strict";

const types = Object.keys( require( './types' ) );

const schema = require( '@openagenda/validators/schema' );

const _ = require( 'lodash/core' );

_.extend( _, { get: require( 'lodash/get' ) } );

const choice = require( '@openagenda/validators/choice' );

schema.register( {
  pass: require( '@openagenda/validators/pass' ),
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' ),
  link: require( '@openagenda/validators/link' ),
  number: require( '@openagenda/validators/number' ),
  date: require( '@openagenda/validators/date' ),
  multilingual: require( '@openagenda/validators/multilingual' ),
  integer: require( '@openagenda/validators/number' ), // i need an integer validator
  choice
} );

const optionedTypes = [ 'radio', 'checkbox', 'select' ];

const minMaxedTypes = [ 'checkbox', 'integer', 'number', 'text', 'textarea', 'markdown', 'multilingual' ];

const multilingualTypes = [ 'text', 'textarea' ];

const validateStandardType = choice( {
  optional: false,
  options: types,
  default: 'text',
  unique: true
} );

module.exports = validate;

function validateType( value, custom = {} ) {

  const dirtyType = _.get( value, 'fieldType', null );

  if ( custom && _.keys( custom ).includes( dirtyType ) ) {

    return dirtyType; 

  }

  return validateStandardType( dirtyType );

}


/**
 * completes schema validation with rules not handled
 * by validation library:
 *
 *  * an option value must be unique within its group
 *  * a max cannot be smaller than a min ( when set )
 */
function validate( value, options = {} ) {

  const custom = _.get( options, 'custom', {} );

  const type = validateType( value, custom );

  const isCustomField = _.keys( custom ).includes( type );

  let errors = [], clean;

  try {

    clean = typeSchemas[ isCustomField ? 'custom' : type ]( value );

  } catch( e ) {

    errors = e;

  }

  // validate any optioned type
  if ( optionedTypes.indexOf( type ) !== -1 ) {

    let unique = value.options.reduce( ( unique, v ) => unique.indexOf( v.value ) === -1 ? unique.concat( v.value ) : unique, [] );

    if ( unique.length !== value.options.length ) {

      errors = errors.concat( {
        field: 'options',
        code: 'duplicate',
        message: 'option values must be unique',
        origin: value
      } );

    }
  
  }

  // validate any
  if ( minMaxedTypes.indexOf( type ) !== -1 && value.min !== undefined && value.max !== undefined ) {

    if ( value.max < value.min ) {

      errors = errors.concat( {
        field: 'max',
        code: 'smallerthan.min',
        message: 'max cannot be smaller than min',
        origin: value
      } )

    }

  }


  if ( multilingualTypes.includes( type ) && _.isArray( value.languages ) ) {

    clean.languages = value.languages;

  }

  if ( errors.length ) throw errors;

  clean.fieldType = type;

  return clean;

}


const typeSchemas = {};

types.concat( 'custom' ).forEach( type => {

  const structure = _.extend( {

    // all custom schema fields must have a field name
    // that is the name that will be used for the input
    // in the form as well as the key in data exports
    field: {
      type: 'text',
      optional: false,
      max: 255
    },

    // the label to be displayed in the form
    label: {
      type: 'multilingual',
      optional: false
    },

    // an informative text can be added adjacent to the form item
    info: {
      type: 'multilingual',
      max: 1000,
      optional: true,
      default: null
    },

    placeholder: {
      type: 'multilingual',
      max: 300,
      optional: true,
      default: null
    },

    write: {
      type: 'choice',
      // potential groups with write access
      options: [ 'contributor', 'moderator', 'administrator' ],
      unique: true,
      optional: true
    },

    read: {
      type: 'choice',
      // potential groups with read access
      options: [ 'contributor', 'moderator', 'administrator' ],
      unique: true,
      optional: true
    },

    optional: {
      type: 'boolean',
      default: true
    },

    // when the field was defined elsewhere ( tag, category or custom )
    origin: {
      type: 'choice',
      default: null,
      unique: true,
      options: [ 'tags', 'categories', 'custom' ]
    }

  },

  minMaxedTypes.indexOf( type ) !== -1 ? {
    min: {
      type: 'integer',
      optional: true
    },
    max: {
      type: 'integer',
      optional: true
    }
  } : {},
  optionedTypes.indexOf( type ) !== -1 ? {
    options: {
      list: {
        min: 1
      },
      fields: {
        id: {
          type: 'integer'
        },
        value: {
          type: 'text',
          optional: false
        },
        label: {
          type: 'multilingual',
          optional: false
        },
        legacyId: {
          type: 'integer',
          optional: true
        }
      }
    }
  } : {} );

  typeSchemas[ type ] = schema( structure );

} );