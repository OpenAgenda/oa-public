"use strict";

process.env.NODE_ENV = 'test';

/**
 * test syncing of elasticsearch
 */

const log = require( '@openagenda/logs' )( 'resetApiCounter tests' );

var config = require( '../../config' ),

should = require( 'should' ),

task = require( '../resetApiCounters.task' ),

async = require( 'async' ),

cbm = require( 'cibulModel' )( config.db ),

should = require( 'should' ),

fixtureSets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

cli,

debug = require( 'debug' );

describe( 'resetApiCounter', function() {

  var user = {};

  //debug.enable( '*' );

  beforeEach( function() {

    cli = require( 'redis' ).createClient( config.redis.port, config.redis.host )

  });

  afterEach( function() {

    cli.quit();

  });

  before( fixtureSets.prepareOneUser( user, 'freddy' ) );

  before( function _buildKeySets( done ) {

    var totalKeys = 40, inserts = [];

    for( var i = 0; i < totalKeys; i++ ) {

      inserts.push({ apiKey: i, type: 1, userId: user.id });

    }

    async.eachSeries( inserts, function( insertData, ecb ) {

      cbm.lib.insert( 'apiKeySet', insertData, function( err, result ) {

        // init count at any number ( insertId works )
        cli.hset( config.api.redis.prefix + result.insertId, config.api.redis.publishCount, result.insertId + 1, ecb );

      } );

    }, done );

  });

  it( 'verify counts reset', function( done ) {

    task.setOnComplete( function() {

      _areZero( function( are ) {

        are.should.equal( true );

        done();

      });

    });

    _areZero(function( are ) {

      are.should.equal( false );

      task.run();

    });

  } );

});

function _areZero( cb ) {

  log( 'areZero?' );

  var are = true;

  cbm.lib.query( 'select id from api_key_set', function( err, rows ) {

    async.eachSeries( rows, function( row, ecb ) {

      cli.hget( config.api.redis.prefix + row.id, config.api.redis.publishCount, function( err, count ) {

        log( 'read %s %s: %s', config.api.redis.prefix + row.id, config.api.redis.publishCount, count );

        if ( parseInt(count, 10) !== 0 ) {

          are = false;

        }

        ecb();

      } );

    }, function( err ) {

      cb( are );

    });

  });

}
