
var log = require( '../../lib/logger' )( 'notification-service' ),

coms = require( '../../lib/coms' ),

async = require( 'async' ),

w = require( 'when' ),

coms = require( '../../lib/coms' ),

wn = require( 'when/node' ),

lib = require( '../../lib/lib' );

module.exports = function ( m, c ) {

  return functions( m, c );

};

var functions = function( model, config ) {

  var exposed = function() {

  	return {
  	  process: process,
      addJob: addJob
  	};

  },

  process = function( values, cb ) {

  	log( 'processing notification of type %d', values.number );

  	_handleType( values, function( err ) {

  	  if ( err ) return cb( err );

  	  return cb( null );

  	} );

  },

  addJob = function( values ) {

    coms.queue( 'jobs', lib.extend( values, { type: 'notification' } ) );

  },

  _handleType = function( values, cb ) {

    var agenda;

  	wn.call( model.reviews().get, { id: values.agendaId } )

  	.then( function( review ) {

  	  if ( !review ) return null;

      agenda = review;

  	  return wn.call( model.notifications().get, { reviewId: values.agendaId, type: values.number } );
  	
  	} )

  	.then( function( notification ) {

  	  if ( !notification ) return wn.call( model.notifications().create, { reviewId: agenda.id, eventId: values.eventId, object: null, ownerId: null, userId: agenda.ownerId, type: 30 } );

  	  return wn.call( model.notifications().update, notification, {} );

  	} )

  	.catch( function( err ) {

  	  if ( err ) return cb( err );

  	} )

  	.done( function() {

  	  return cb();

  	} );

  };

  return exposed();

};