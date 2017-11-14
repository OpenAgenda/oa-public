"use strict";

var queueLib = require( '@openagenda/queue' ), q,

utils = require( '@openagenda/utils' ),

getAccount,

logger = require( './logger' ), log,

onProcessed = false; // for testing

module.exports = launch;

utils.extend( module.exports, {
  init: init,
  queue: queue,
  shutdown: shutdown,
  setOnProcessed: setOnProcessed
});


function launch() {

  log = logger( 'task' );

  if ( !q ) return _err( 'emailstrategie has not been initialized' );

  q.setConsumer( process );

  q.launch();

}

function shutdown() {

  if ( !q ) return _err( 'emailstrategie has not been initialized' );

  q.shutdown();

}

function init( c, get ) {

  q = queueLib( 'emailstrategie', { redis: c } );

  getAccount = get;

}

function queue( data, cb ) {

  if ( !q ) return _err( 'emailstrategie has not been initialized', cb );

  q( data, cb );

}

function process( data, cb ) {

  if ( [ 'setItem', 'removeItem', 'clear', 'setState' ].indexOf( data.name ) == -1 ) {

    return cb( 'unknown task' );

  }

  if ( !data.accountId ) return cb( 'no account id' );

  if ( !data.listId ) return cb( 'no list id' );

  getAccount( data.accountId, function( err, account ) {

    if ( err ) return cb( err );

    if ( !account ) return cb( 'no account could be loaded' );

    account.getList( data.listId, function( err, list ) {

      if ( err ) return cb( err );

      if ( !list ) {

        log( 'error', 'no list could be loaded' );

        return cb();

      }

      if ( data.name == 'setItem' ) {

        list.setItem( data.id, data.data, _complete( list, 'setItem', cb ) );

      } else if ( data.name == 'removeItem' ) {

        list.removeItem( data.id, _complete( list, 'removeItem', cb ) );

      } else if ( data.name == 'clear' ) {

        list.clear( _complete( list, 'clear', cb ) );

      } else if ( data.name == 'setState' ) {

        list.setState( data.state, _complete( list, 'setState', cb ) );

      } else {

        cb( 'unknown action' );

      }

    });

  });

}

function setOnProcessed( cb ) {

  onProcessed = cb;

}

function _complete( obj, method, cb ) {

  return function( err ) {

    if ( onProcessed ) onProcessed( err, obj, method );

    cb( err );

  }

}

function _err( message, cb ) {

  if ( cb ) return cb( message );

  throw message;

}