"use strict";

const defaults = {
  schemaMap: require( './defaults' ).camelCaseSchemaMap,
  res: null,
  pull: false,
  onTransferChange: () => {}
};

const extend = require( 'lodash/extend' );

const schema = require( 'validators/schema' );

const types = require( './credentialTypes' );

const Link = require( './Link' );

module.exports = class {

  constructor( data, options, cb ) {

    const clean = _cleanConstructor( [ data, options, cb ] );

    extend( this, {
      _schema: schema( clean.options.schemaMap ),
      _fieldValues: _extractFieldValues( clean.data ),
      _credential: _extractCredential( clean.data ),
      _hooks: {
        onBusyChange: clean.options.onBusyChange
      }
    } );

    if ( clean.options.res ) {

      let link = this.setRes( clean.options.res );

    }

    if ( !clean.options.res || !clean.options.pull ) {

      return clean.cb( null, this );

    }

    link.get( ( err, data ) => {

      if ( err ) {

        return clean.cb( err );

      }

      this.set( data );

      clean.cb( null, this );

    } );

  }

  isValid( partial = false ) {

    return !this.getErrors( partial ).length;

  }

  setRes( res ) {

    this.link = new Link( res );

    this.link.setHooks( this._hooks );

    return this.link;

  }

  hasRes() {

    return !!this.link;

  }

  getErrors( partial = false ) {

    let errors = [];

    try {

      this._schema( this._fieldValues );

    } catch( e ) { errors =  e };

    if ( !partial ) return errors;

    return errors.filter( e => e.origin !== undefined && e.origin !== '' );

  }

  set( data ) {

    this._fieldValues = _extractFieldValues( data );

    if ( data && data.credential ) {

      this._credential = data.credential;

    }

    return this.getErrors();

  }

  get( standardized ) {

    if ( this._credential === null && !standardized ) {

      return this._fieldValues;

    }

    return extend( {
      fieldValues: this._fieldValues
    }, this._credential ? {
      credential: this._credential
    } : {} );

  }

  isSynced( cb ) {

    if ( !this.link ) return cb( 'No link is established with server' );

    this.link.isSynced( this.get( true ), cb );

  }

  commit( allowPartial, cb ) {

    if ( arguments.length === 1 ) {
      cb = allowPartial;
      allowPartial = false;
    }

    if ( !this.link ) return cb( 'No link is established with server' );

    let errors = this.getErrors( allowPartial );

    if ( errors.length ) {

      return cb( null, {
        success: false,
        valid: false,
        errors
      } );

    }

    this.link.commit( this.get(), err => {

      if ( err ) return cb( err );

      cb( null, extend( {
        success: true,
        valid: true,
        errors: []
      }, this.get( true ) ) );

    } );

  }

}

function _cleanConstructor( args ) {

  let options = {}, data = null, cb = () => {}

  if ( args.length === 3 ) {

    if ( args[ 2 ] ) cb = args[ 2 ];
    options = args[ 1 ];
    data = args[ 0 ];

  } else if ( args.length === 2 ) {

    options = args[ 1 ];
    data = args[ 0 ];

  } else if ( args.length === 1 ) {

    data = args[ 0 ];

  }

  return {
    data,
    options: extend( {}, defaults, options ),
    cb
  }

}

function _extractFieldValues( data ) {

  if ( data && data.fieldValues ) return data.fieldValues;

  return data;

}

function _extractCredential( data ) {

  if ( data && data.credential ) return data.credential;

  return null;

}