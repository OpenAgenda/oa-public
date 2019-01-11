"use strict";

const _ = {
  pick: require( 'lodash/pick' ),
  keys: require( 'lodash/keys' ),
  assign: require( 'lodash/assign' ),
  isObject: require( 'lodash/isObject' ),
  omit: require( 'lodash/omit' )
}

const ih = require( 'immutability-helper' );

const validateField = require( './validateField' );

const getSchema = require( './getSchema' );

module.exports = class {

  constructor( data ) {

    // { fields, nextOptionId, res, id, custom }
    this.data = validate( data, true );

  }

  // get clean data
  getData() {

    return this.data;

  }

  addField( data ) {

    const clean = validateField( data, {
      custom: this.data.custom,
    } );

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

  getFileFields() {

    return this.data.fields.filter( f => [ 'image', 'file' ].includes( f.fieldType ) );

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

    if ( _.isObject( accessType ) ) {

      options = accessType;
      accessType = null;

    }

    return getSchema( this.data.fields, accessType, accessLevel, ih( options, { custom: { $set: this.data.custom } } ) );

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

function validate( data, client = false ) {

  let errors = [],

  dirty = _.assign( {
    id: null,
    nextOptionId: 1,
    fields: [],
    res: null,
    custom: null,
    defaultLabelLanguage: null
  }, data || {} ),

  // these we take as is
  clean = _.pick( dirty, [
    'id',
    'nextOptionId',
    'res',
    'custom',
    'defaultLabelLanguage'
  ] );

  clean.fields = [];

  // clean each field
  dirty.fields.forEach( f => {

    if ( f.fieldType === 'abstract'  || !f.fieldType ) return;

    try {

      clean.fields.push( validateField( f, {
        custom: clean.custom,
        defaultLabelLanguage: clean.defaultLabelLanguage
      } ) );

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

  return client ? clean : _.omit( clean, [ 'res', 'id' ] );

}


function _isNew( data ) {

  return data.id === null;

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
