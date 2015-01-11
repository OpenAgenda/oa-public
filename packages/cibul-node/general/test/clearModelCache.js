"use strict";

process.env.NODE_ENV = 'test';

/**
 * test syncing of elasticsearch
 */

var config = require( '../../config' ),

log = require( '../../lib/logger' )( 'resetApiCounter tests' ),

should = require( 'should' ),

task = require( '../clearModelCache.task' ),

async = require( 'async' ),

cbm = require( 'cibulModel' )( config.db ),

should = require( 'should' ),

fixtureSets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

cli = require( 'redis' ).createClient( config.redis.port, config.redis.host ),

debug = require( 'debug' ),

log;

describe( 'clearModelCache', function() {

  var agenda = {};

  before( fixtureSets.prepareOneAgendaInstance( agenda, 'la-gargouille' ))

  before( function _setModelCache( done ) {

    cli.set( 'modelcache:reviews:' + agenda.id, 'Woopidoo', done );

  });

  it( 'agenda caches have been cleared', function( done ) {

    task.setOnComplete( function() {

      cli.get( 'modelcache:reviews:' + agenda.id, function( err, value ) {

        should( value ).equal( null );

        done();

      });

    });

    cli.get( 'modelcache:reviews:' + agenda.id, function( err, value ) {

      value.should.equal( 'Woopidoo' );

      task.run();

    } );

  });

});