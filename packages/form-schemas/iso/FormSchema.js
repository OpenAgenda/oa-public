"use strict";

const _ = {
  pick: require( 'lodash/pick' ),
  keys: require( 'lodash/keys' ),
  extend: require( 'lodash/extend' ),
  isObject: require( 'lodash/isObject' )
}

const validateField = require( './validateField' );

const getSchema = require( './getSchema' );

module.exports = class {

  constructor( data, options = {} ) {

    this.custom = options.custom;

    // { fields, nextOptionId, res, id }
    this.data = validate( data, { custom: this.custom, client: true } );

  }

  // get clean data
  getData() {

    return this.data;

  }

  addField( data ) {

    let clean = validateField( data, { custom: this.custom } );

    if ( !this.isFieldNameAvailable( clean.field ) ) {

      throw 'This field name is taken! : ' + clean.field;

    }

    this.data.fields.push( clean );

  }

  getField( index ) {

    this._checkFieldIndex( index );

    return this.data.fields[ index ];

  }

  getFields() {

    return this.data.fields;

  }

  moveField( index, moves ) {

    let newIndex = index + moves;

    this._checkFieldIndex( newIndex, 'Move value exceeds possible value' );

    let field = this._popField( index );

    this.data.fields.splice( newIndex, 0, field );

  }

  removeField( index ) {

    this._checkFieldIndex( index );

    this._popField( index );

  }

  isFieldNameAvailable( name ) {

    return !this.data.fields.filter( f => f.field == name ).length;

  }

  getFieldCount() {

    return this.data.fields.length;

  }

  isEmpty() {

    return !this.data.fields.length;

  }

  isNew() {

    return _isNew( this.data );

  }

  getValidate( accessType = null, accessLevel = null, options = {}) {

    return getSchema( this.data.fields, accessType, accessLevel, _.extend( options, { custom: this.custom } ) );

  }

  _checkFieldIndex( index, errorMessage = 'Index exceeds schema size' ) {

    if ( index < 0 || index >= this.getFieldCount() ) {

      throw errorMessage;

    }

  }

  _popField( index ) {

    return this.data.fields.splice( index, 1 )[ 0 ];

  }

}

module.exports.validate = validate;

function validate( data, options = false ) {

  const {
    client, // is FormSchema running on client?
    custom // eventual custom validators
  } = _.extend( {
    client: _.isObject( options ) ? false : options,
    custom: {}
  }, _.isObject( options ) ? options : {} );

  let errors = [],

  dirty = _.extend( {
    id: null,
    nextOptionId: 1,
    fields: [],
    res: null
  }, data || {} ),

  // these we take as is
  clean = _.pick( dirty, [ 'id', 'nextOptionId', 'res' ] );

  clean.fields = []

  // clean each field
  dirty.fields.forEach( f => {

    if ( f.fieldType === 'abstract'  || !f.fieldType ) return;

    try {

      clean.fields.push( validateField( f, { custom } ) );

    } catch ( e ) {

      errors = errors.concat( e );

    }

  } );

  if ( errors.length ) {

    throw errors;

  }
  
  let biggestId = clean.fields

    // consider fields with options only
    .filter( f => f.options )

    // build one big options list
    .reduce( ( options, f ) => options.concat( f.options ), [] )

    // keep biggest id
    .reduce( ( biggestId, o ) => o.id > biggestId ? o.id : biggestId, 0 );

  if ( _isNew( clean ) ) {

    _assignOptionIds( clean );

  }

  if ( !_isNew( clean ) && biggestId >= clean.nextOptionId ) {

    throw new Error( 'nextOptionId is invalid' );

  }

  return client ? clean : _omit( clean, [ 'res', 'id' ] );

}


function _isNew( data ) {

  return data.id === null;

}

function _omit( obj, fields = [] ) {

  let filtered = {};

  _.keys( obj ).forEach( k => {

    if ( fields.indexOf( k ) !== -1 ) return;

    filtered[ k ] = obj[ k ];

  } );

  return filtered;

}


function _assignOptionIds( data ) {

  data.fields.forEach( field => {

    if ( !field.options ) return;

    field.options.forEach( o => {

      if ( o.id && o.id >= data.nextOptionId ) {

        data.nextOptionId++;

      }

      if ( o.id ) return;

      o.id = data.nextOptionId++;

    } );

  } );

}