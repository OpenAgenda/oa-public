"use strict";

var log = require( 'logger' )( 'agenda event search' ),

es = require( '../../elasticsearch' ),

Readable = require( 'stream' ).Readable,

util = require( 'util' );

util.inherits( Search, Readable );

module.exports = require( '../../lib/instanceLoader' )( ( loaded, instance ) => {

  return {
    search: search,
    searchStream: searchStream,
    aggregate: aggregate,
    resync: resync
  }

  function resync( cb ) {

    es.agendas( instance ).resync( ( err ) => {

      if ( err ) return cb( err );

      loaded.refresh( cb );

    } );

  }

  function aggregate( query, options, cb ) {

    es.agendas( instance ).aggregate( query, options, cb );

  }

  function search( query, options, cb ) {

    es.agendas( instance ).search( query, options, cb );

  }

  function searchStream( query, options ) {

    return new Search( instance, query, options );

  }

});

function Search( instance, query, options ) {

  Readable.call( this, { objectMode: true } );

  this._instance = instance;
  this._query = query;
  this._options = options ? options : {};

  this._options.page = 0;
  this._unstreamed = [];

}

Search.prototype._read = function() {

  if ( this._unstreamed.length ) {

    this._pushNext();

  } else {

    this._fetchAndPush();

  }

}

Search.prototype._pushNext = function() {

  this.push( this._unstreamed.shift() );

}

Search.prototype._fetchAndPush = function() {

  var self = this;

  this._options.page++;

  log( 'fetching events' );

  es.agendas( this._instance ).search( this._query, this._options, function( err, result ) {

    if ( err ) {

      log( 'error', 'event fetch error');

      self.push( null );

      return;

    }

    if ( result.events.length ) {

      self._unstreamed = result.events;

      self._pushNext();

      return;

    }

    self.push( null );

  });

}