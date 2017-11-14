"use strict";

var q = require( './queue' ),

log = require( '@openagenda/logger' )( 'services/lib/instanceQueue/task' ),

w = require( 'when' ),

services = {
  agenda: require( '../../agenda' ),
  event: require( '../../event' ),
  user: require( '../../user' )
};

module.exports = run;

function run() {

  q.setConsumer( process );

  q.launch();

}

function process( data, cb ) {

  w( {
    data: data,      // instanceType, identifiers, methodName, args 
    instance: false
  } )

  .then( _validate )

  .then( _loadInstance )

  .then( _runMethod )

  .done( ( v ) => {

    log( 'info', 'process completed' );

    cb();

  }, ( err ) => {

    if ( err ) log( 'error', 'error: %s, queued data: %s', err, JSON.stringify( data ) );

    cb();

  } );

}


function _validate( v ) {

  if ( [ 'event', 'agenda', 'user' ].indexOf( v.data.instanceType ) == -1 ) {

    throw 'unkown instance type';

  }

  if ( !v.data.identifiers ) {

    throw 'identifiers are missing';

  }

  if ( typeof v.data.methodName !== 'string' ) {

    throw 'method name is missing';

  }

  if ( v.data.args && !utils.isArray( v.data.args ) ) {

    throw 'args should be an array'

  }

  return v;

}

function _loadInstance( v ) {

  var d = w.defer();

  services[ v.data.instanceType ].get( v.data.identifiers, ( err, inst ) => {

    if ( err ) return d.reject( err );

    if ( !inst ) return d.reject( 'instance not found' );

    v.instance = inst;

    d.resolve( v );

  } );

  return d.promise;

}

function _runMethod( v ) {

  var d = w.defer();

  var args = ( v.data.args ? v.data.args : [] ).concat( function( err ) {

    if ( err ) return w.reject( err );

    w.resolve( v );

  } );

  v.instance[ v.data.methodName ].apply( null, args );

  return d.promise;

}