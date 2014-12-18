"use strict";

/**
 * task that syncs services' events 
 * as Cibul events are modified/added/deleted
 */


var log = require( '../lib/logger' )( 'agenda_bridges task' ),

async = require( 'async' ),

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

model = cmn.getCibulModel(),

running = false,

_onStart,

_onComplete,

services = [ 'swapcard' ],

jobHandlers = {
  'event.publish' : true,
  'event.delete' : true,
  'event.update' : true,
};


/**
 * exposed function list
 */

exports.load = cmn.makeLoad( run );
exports.run = run;

// for testing
exports.setOnStart = setOnStart;
exports.setOnComplete = setOnComplete;
exports.setComs = setComs;


function run() {

  if ( running ) {

    log( 'already running' );

    return;

  }

  log( 'running' );

  running = true;

  coms.subscribe( config.mainChannel, _handleJob );

}

function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}


function setComs( c ) {

  coms = c;

}


function _handleJob( err, job ) {

  if ( _onStart ) _onStart();

  var formatted; // for parsed job

  log( 'handling job' );

  if ( err ) {

    return _handleError( err );

  }

  // parse the thing

  formatted = _parseJob( job );

  if ( !formatted ) return;


  // handle the thing

  _processJob( formatted, function( err ) {

    if ( err ) {

      _handleError( err );

      return;

    }

    log( 'job %s was successfully done', 'event.' + formatted.name );

    if ( _onComplete ) _onComplete( null, formatted );

  } );

}

function _processJob( job, cb ) {

  var store;

  if ( job.name == 'delete' ) {

    wn.call( model.events().getDeleted, { id: job.id } )

    .then( function( del ) {

      if ( !del ) return cb( 'Object not found' );

      return wn.call( async.eachSeries, del.store.articles, _checkServices( job, del ) );

    } )

    .then( function( ) {

      return cb();

    } )

    .catch( function( err ) { 

      if ( err ) return cb( err );

    } );


  } else {

    if ( job.id === undefined ) {

      return cb( 'job ' + job.jobName + ' id is not defined' );

    }

    model.events().get( { id: job.id }, function( err, obj ) {

      if ( err ) {

        return cb( err );

      }

      if ( obj === undefined ) {

        return cb( 'event of id ' + job.id + ' was not found' );

      }

      log( 'processing job of type %s', job.name );
      
      obj = model.events().instance( obj );

      async.eachSeries( obj.articles, _checkServices( job, obj ), function( err ) {

        if ( err ) return cb( err );

        cb();

      });

    });
    
  }

}

/**
 * wrap things up
 */

function _handleError() {

  var args = Array.prototype.slice.call( arguments );

  log.apply( null, args );

  if ( _onComplete ) _onComplete( 'error' );

}


/**
 * read and extract job data
 */

function _parseJob( job ) {

  var data;

  if ( typeof job == 'string' ) {

    try {

      data = JSON.parse( job );

    } catch( e ) {

      _handleError( 'could not parse job "%s"', job );

      return false;

    }

  } else {

    data = job;

  }

  if ( !jobHandlers[ data.name ] ) {

    _handleError( 'received unhandled job "%s"', data.name );

    return false;

  }

  return {

    jobName: data.name,

    type: data.name.split('.').shift(),
    
    name: data.name.split('.').pop(),

    id: data.values.id

  };

}

function _checkServices( job, obj ) {

  return function( article, cb ) {

    model.reviews().get( { id: article.review.id }, function( err, agenda ) {

      if ( err ) return cb( err );

      log( 'checking services for agenda %s', agenda.title );

      if ( !agenda ) return cb( 'Not a valid agenda' );

      agenda = model.reviews().instance( agenda );

      for ( var key in services ) {

        if ( agenda.getStore( services[ key ], null ) ) {

          log( 'adding to queue service of type %s and action %s', services[ key ], job.name );

          if ( job.name != 'delete' ) job.name = ( !obj.getStore( services[ key ], null ) ) ? 'publish' : 'update';

	        require( '../services/' + services[ key ] + '/' + services[ key ] )( model, config )[ 'addJob' ]( job.id, agenda.id, job.name );

        } else log( 'nothing to do with the service %s', services[ key ] );

      }

      cb();

    } );

  };

}