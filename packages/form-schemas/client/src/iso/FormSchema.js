"use strict";

const _ = {
  assign: require( 'lodash/assign' ),
  get: require( 'lodash/get' ),
  isObject: require( 'lodash/isObject' ),
  isArray: require( 'lodash/isArray' ),
  isString: require( 'lodash/isString' ),
  keys: require( 'lodash/keys' ),
  omit: require( 'lodash/omit' ),
  pick: require( 'lodash/pick' )
}

const ih = require( 'immutability-helper' );

const {
  extractNextOptionId
} = require( './fieldOptions' );

const validateField = require( './validateField' );
const validateFieldAndAssignOptionIds = require( './validateFieldAndAssignOptionIds' );

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

  addField( fieldData ) {

    const {
      field: clean,
      nextOptionId
    } = validateFieldAndAssignOptionIds( fieldData, _.pick( this.data, [
      'custom', 'defaultLabelLanguage', 'nextOptionId'
    ] ) );

    if ( !this.isFieldNameAvailable( clean.field ) ) {

      throw 'This field name is taken! : ' + clean.field;

    }

    this.data.nextOptionId = nextOptionId;

    this.data.fields.push( clean );

  }

  updateField( fieldData ) {

    const {
      field: clean,
      nextOptionId
    } = validateFieldAndAssignOptionIds( fieldData, _.pick( this.data, [
      'custom', 'defaultLabelLanguage', 'nextOptionId'
    ] ) );

    const fieldIndex  = this._getFieldIndex( clean.field );

    this.data.nextOptionId = nextOptionId;

    this.data.fields.splice( fieldIndex, 1, clean );

  }

  getField( indexOrName ) {

    const index = this._getFieldIndex( indexOrName );

    this._checkFieldIndex( index );

    return this.data.fields[ index ];

  }

  getFields() {

    return this.data.fields;

  }

  getFileFields() {

    return this.data.fields.filter( f => [ 'image', 'file' ].includes( f.fieldType ) );

  }

  moveField( indexOrName, moves ) {

    const index = this._getFieldIndex( indexOrName );

    this.moveFieldTo( index, index + moves );

  }

  moveFieldTo( indexOrName, newIndex ) {

    const index = this._getFieldIndex( indexOrName );

    this._checkFieldIndex( newIndex, 'Move value exceeds possible value' );

    const field = this._popField( index );

    this.data.fields.splice( newIndex, 0, field );

  }

  removeField( indexOrName ) {

    const index = this._getFieldIndex( indexOrName );

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

  updateFields( fields ) {

    const updatedFieldsNames = fields.map( f => f.field );

    let updated = this.data;

    // remove
    _.get( this, 'data.fields' )
      .filter( f => !updatedFieldsNames.includes( f.field ) )
      .forEach( fieldToRemove => this.removeField( fieldToRemove ) );

    // add and update
    fields.forEach( ( f, i ) => {

      if ( this.getFieldExists( f.field ) ) {

        this.updateField( f );

      } else {

        this.addField( f );

      }

    } );

    fields.map( ( f, i ) => this.moveFieldTo( f.field, i ) );

    return this.data.fields;

  }

  getValidate( accessType = null, accessLevel = null, options = {}) {

    if ( _.isObject( accessType ) ) {

      options = accessType;
      accessType = null;

    }

    return getSchema( this.data.fields, accessType, accessLevel, ih( options, { custom: { $set: this.data.custom } } ) );

  }

  getFieldExists( indexOrName ) {

    if ( _.isString( indexOrName ) ) {

      return this._getFieldIndex( indexOrName ) === -1 ? false : true;

    }

    return indexOrName < this.data.fields.length;

  }

  _getFieldIndex( indexOrName ) {

    const fieldNames = this.data.fields.map( f => f.field );

    return _.isString( indexOrName ) ? fieldNames.indexOf( indexOrName ) : indexOrName;

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
    'res',
    'custom',
    'defaultLabelLanguage'
  ] );

  clean.nextOptionId = extractNextOptionId( data );

  clean.fields = [];

  // clean each field
  dirty.fields.forEach( f => {

    try {

      const {
        field: cleanField,
        nextOptionId: updatedNextOptionId
      } = validateFieldAndAssignOptionIds( f, _.pick( clean, [
        'custom', 'defaultLabelLanguage', 'nextOptionId'
      ] ) );

      clean.nextOptionId = updatedNextOptionId;

      clean.fields.push( cleanField );

    } catch ( e ) {

      if ( !_.isArray( e ) ) throw _.assign( e, { message: `Validation of field ${f.field} failed: ${e.message}` } );

      errors = errors.concat( e );

    }

  } );

  if ( errors.length ) {

    throw errors;

  }

  return client ? clean : _.omit( clean, [ 'res', 'id' ] );

}


function _isNew( data ) {

  return data.id === null;

}
