"use strict";

const defaults = {
  schemaMap: require( './defaults' ).schemaMap,
  res: null,
  pull: false,
  onTransferChange: () => {}
};

const extend = require( 'lodash/extend' );

const schema = require( 'validators/schema' );

const Link = require( './Link' );

module.exports = class {

  constructor( data, options, cb ) {

    const clean = _cleanConstructor( [ data, options, cb ] );

    extend( this, {
      _schema: schema( clean.options.schemaMap ),
      _data: clean.data,
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

  isValid() {

    return !this.getErrors().length;

  }

  setRes( res ) {

    this.link = new Link( res );

    this.link.setHooks( this._hooks );

    return this.link;

  }

  hasRes() {

    return !!this.link;

  }

  getErrors() {

    let errors = [];

    try {

      this._schema( this._data );

    } catch( e ) { errors =  e };

    return errors;

  }

  set( data ) {

    this._data = data;

    return this.getErrors();

  }

  get() {

    return this._data;

  }

  isSynced( cb ) {

    if ( !this.link ) return cb( 'No link is established with server' );

    this.link.isSynced( this._data, cb );

  }

  commit( cb ) {

    if ( !this.link ) return cb( 'No link is established with server' );

    let errors = this.getErrors();

    if ( errors.length ) {

      return cb( null, {
        success: false,
        valid: false,
        errors
      } );

    }

    this.link.commit( this._data, cb );

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