"use strict";

const _ = require( 'lodash/core' );

const choice = require( '@openagenda/validators/choice' );
const schema = require( '@openagenda/validators/schema' );

const types = Object.keys( require( './types' ) );
const areFieldLabelsMultilingual = require( './areFieldLabelsMultilingual' )

_.extend( _, {
  assign: require( 'lodash/assign' ),
  includes: require( 'lodash/includes' ),
  get: require( 'lodash/get' ),
  set: require( 'lodash/set' ),
  keys: require( 'lodash/keys' )
} );

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

const optionedTypes = [ 'radio', 'checkbox', 'select', 'abstract' ];

const minMaxedTypes = [ 'custom', 'checkbox', 'integer', 'number', 'text', 'textarea', 'markdown', 'multilingual', 'html', 'slate', 'abstract' ];

const multilingualTypes = [ 'text', 'textarea', 'html', 'markdown', 'slate', 'abstract' ];

const validateStandardType = choice( {
  optional: false,
  options: types,
  default: 'text',
  unique: true
} );

module.exports = validate;

function validateType( value, custom = {} ) {

  const dirtyType = _.get( value, 'fieldType', 'abstract' );

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
  const isAbstract = type === 'abstract';

  let errors = [];

  const fieldSchema = buildFieldSchema(
    isCustomField ? 'custom' : type, {
    defaultLabelLanguage: options.defaultLabelLanguage,
    isMultilingual: areFieldLabelsMultilingual( value )
  } );

  const clean = schema( isAbstract ? _stripUndefinedSchemaFields( fieldSchema, value ) : fieldSchema )( value );

  // enableWith tells validator it is active if field specified has a value.
  // if set, the field must be part of related fields
  if ( clean.enableWith && !_.get( clean, 'related', [] ).includes( clean.enableWith ) ) {

    clean.related = _.get( clean, 'related', [] ).concat( clean.enableWith );

  }

  // if is custom or abstract field, do not filter out remaining values
  if ( isCustomField || isAbstract ) {

    _.keys( value )
      .filter( key => !_.includes( _.keys( clean ) ) )
      .forEach( key => clean[ key ] = value[ key ] );

  }

  // validate any optioned type
  if ( optionedTypes.includes( type ) ) {

    const unique = _.get( value, 'options', [] ).reduce( ( unique, v ) => unique.indexOf( v.value ) === -1 ? unique.concat( v.value ) : unique, [] );

    if ( unique.length !== _.get( value, 'options', [] ).length ) {

      errors = errors.concat( {
        field: 'options',
        code: 'duplicate',
        message: 'option values must be unique',
        origin: value
      } );

    }

  }

  // validate any
  if ( ( minMaxedTypes.includes( type ) || isCustomField ) && value.min !== undefined && value.max !== undefined ) {

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


function buildFieldSchema( type, options = {} ) {

  const {
    languages,
    defaultLabelLanguage,
    isMultilingual
  } = _.assign( {
    defaultLabelLanguage: null,
    isMultilingual: true
  }, options );

  const labelFieldType = isMultilingual || defaultLabelLanguage ? 'multilingual' : 'text';

  const structure = {
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
      type: labelFieldType,
      optional: false,
      defaultLanguage: defaultLabelLanguage
    },

    // the optional help text
    help: {
      type: labelFieldType,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },

    helpLink: {
      type: 'link',
      optional: true,
      default: null
    },

    default: {
      type: 'pass', // dependent on type of field
      optional: true
    },

    // an informative text can be added adjacent to the form item
    info: {
      type: labelFieldType,
      max: 1000,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },

    sub: {
      type: labelFieldType,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },

    placeholder: {
      type: labelFieldType,
      max: 300,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },

    write: {
      type: 'text',
      optional: true,
      list: { default: null }
    },

    read: {
      type: 'text',
      optional: true,
      list: { default: null }
    },

    optional: {
      type: 'boolean',
      default: true
    },

    display: {
      type: 'boolean',
      default: true
    },

    // when the field was defined elsewhere ( tag, category or custom )
    origin: {
      type: 'choice',
      default: null,
      unique: true,
      options: [ 'tags', 'categories', 'custom' ]
    },

    // other field that defines if this field should be enabled
    enableWith: {
      type: 'text',
      default: null
    },

    related: {
      type: 'text',
      default: [],
      list: true
    }

  };

  if ( minMaxedTypes.includes( type ) ) {

    _.assign( structure, {
      min: {
        type: 'integer',
        optional: true
      },
      max: {
        type: 'integer',
        optional: true
      }
    } );

  }

  if ( [ 'image', 'file' ].includes( type ) ) {

    _.assign( structure, {
      extensions: {
        type: 'text',
        optional: true,
        list: true
      },
      store: { // store variables depend on type ( s3 needs a region and a bucket )
        type: 'pass',
        optional: true
      }
    } );

  }

  if ( optionedTypes.includes( type ) ) {

    _.assign( structure, {
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
            optional: false,
            defaultLanguage: defaultLabelLanguage
          },
          legacyId: {
            type: 'integer',
            optional: true
          }
        }
      }
    } );

  }

  return structure;

}


function _stripUndefinedSchemaFields( fieldSchema, value ) {

  return _.keys( fieldSchema ).reduce(
    ( stripped, key ) => value[ key ] !== undefined
      ? _.set( stripped, key, fieldSchema[ key ] )
      : stripped,
    {} );

}
