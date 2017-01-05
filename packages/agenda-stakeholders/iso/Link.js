"use strict";

const _ = {
  extend: require( 'lodash/extend' ),
  isEqual: require( 'lodash/isEqual' )
}

const sa = require( 'superagent' );

const defaults = {
  timeout: 10000,
  res: null
}

module.exports = class {

  constructor( config ) {

    this.params = _.extend( {}, defaults, typeof config === 'string' ? { res: config } : config );

    this.setRes( this.params.res );

    _.extend( this, {
      _busy: false,
      _cached: null
    } );

  }

  isSynced( data, cb ) {

    this.get( ( err, remoteData ) => {

      if ( err ) return cb( err );

      return cb( null, this._compareCached( data ) );

    } );

  }

  isBusy() {

    return this._busy;

  }

  setHooks( hooks ) {

    this._hooks = hooks || {};

  }

  get( cb ) {

    if ( this._cached ) return cb( null, this._cached );

    if ( this.isBusy() ) {

      return cb( 'cannot commit, link is already busy' );

    }

    this._busyChange( true );

    sa.get( this.getRes() )

      .timeout( this.params.timeout )

      .send()

    .end( ( err, res ) => {

      this._busyChange( false );

      if ( err ) return cb( err );

      this._cached = res.body;

      cb( null, res.body );

    } );

  }

  commit( data, cb ) {

    if ( !this.hasRes() ) {

      return cb( 'no ressource is defined' );

    }

    if ( this.isBusy() ) {

      return cb( 'cannot commit, link is already busy' );

    }

    this._busyChange( true );

    sa.post( this.getRes() )

      .timeout( this.params.timeout )

      .send( data )

    .end( ( err, res ) => {

      this._busyChange( false );

      if ( err ) return cb( err );

      this._cached = res.body;

      cb( null );

    } );

  }

  setRes( res ) {

    this._res = res;

  }

  hasRes() {

    return !!this._res;

  }

  getRes() {

    return this._res;

  }

  isBusy() {

    return !!this._busy;

  }

  _compareCached( data ) {

    return _.isEqual( data, this._cached );

  }

  _busyChange( value ) {

    if ( this._busy === !!value ) return;

    this._busy = !!value;

    this._callHook( 'onBusyChange', value );

  }

  _callHook( hook, value ) {

    if ( this._hooks && this._hooks[ hook ] ) {

      this._hooks[ hook ]( value );

    }

  }

}