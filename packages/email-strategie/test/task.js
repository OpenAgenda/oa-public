"use strict";

var should = require( 'should' ),

lib = require( '../' ),

redis = require( 'redis' ),

mysql = require( 'mysql' ),

dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'grut',
  database: 'emailstrategietest'
},

redisConfig = {
  host: 'localhost',
  port: 6379
},

creds = require( './lib/creds' );

describe( 'queued setItem, removeItem and clear', function() {

  this.timeout( 10000 );

  var account, list;

  beforeEach( _dropDb );

  beforeEach( _clearRedis );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: redisConfig
    } );

    lib.linkAccount( creds.login, creds.password, function( err, a ) {

      account = a;

      done();

    } );

  });

  beforeEach( function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, l ) {

      list = l;

      done();

    } );

  });

  afterEach( function( done ) {

    list.remove( function( err, result ) {

      done();

    } );

  });

  it( 'queues setItem when no callback', function( done ) {

    var cli = _redisCli(),

    data = { t1: 'is', t2: 'there', t3: 'anybody' };

    cli.blpop( 'emailstrategie', 0, function( err, response ) {

      should( err ).equal( null );

      response[ 1 ].should.eql( JSON.stringify( {
        data: {
          name: 'setItem',
          accountId: 1,
          listId: list.id,
          id: 1,
          data
        },
        _params: {
          delay: false,
          scheduledAt: false
        }
      } ) );

      cli.quit();

      done();

    });

    list.setItem( 1, data );

  } );

  it( 'queues removeItem when no callback', function( done ) {

    var cli = _redisCli(),

    data = { t1: 'is', t2: 'there', t3: 'anybody' };

    cli.blpop( 'emailstrategie', 0, function( err, response ) {

      should( err ).equal( null );

      response[ 1 ].should.eql( JSON.stringify( {
        data: {
          name: 'removeItem',
          accountId: 1,
          listId: list.id,
          id: 1
        },
        _params: {
          delay: false,
          scheduledAt: false
        }
      } ) );

      cli.quit();

      done();

    });

    list.removeItem( 1 );

  } );

} );


describe( 'queued items are processed', function() {

  this.timeout( 20000 );

  var account, list;

  beforeEach( _dropDb );

  beforeEach( _clearRedis );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: redisConfig
    } );

    lib.linkAccount( creds.login, creds.password, function( err, a ) {

      account = a;

      done();

    } );

  });

  beforeEach( function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, l ) {

      list = l;

      done();

    } );

  });

  beforeEach( function() {

    lib.task();

  });

  afterEach( function( done ) {

    list.remove( function( err, result ) {

      done();

    } );

  });

  afterEach( function() {

    lib.task.shutdown();

  });

  it( 'setItem is processed through queue', function( done ) {

    var data = { t1: 'is', t2: 'there', t3: 'anybody' },

    i = 3;
    
    lib.task.setOnProcessed( function() {

      i--;

      if ( !i ) list.getCount( function( err, count ) {

        count.should.equal( 3 );

        done();

      });

    });

    list.setItem( 1, data );
    list.setItem( 2, data );
    list.setItem( 3, data );

  });

  it( 'removeItem is processed through queue', function( done ) {

    var data = { t1: 'is', t2: 'there', t3: 'anybody' },

    i = 5;

    lib.task.setOnProcessed( function() {

      i--;

      if ( !i ) list.getCount( function( err, count ) {

        count.should.equal( 1 );

        done();

      });

    });

    list.setItem( 1, data );
    list.setItem( 2, data );
    list.setItem( 3, data );
    list.removeItem( 1 );
    list.removeItem( 2 );

  });

} );


function _redisCli() {

  return redis.createClient( redisConfig.port, redisConfig.host );

}

function _clearRedis( cb ) {

  var cli = _redisCli();

  cli.del( 'emailstrategie', function() {

    cli.quit();

    cb();

  } );

}


function _dropDb( cb ) {

  var cli = mysql.createConnection( {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  } );

  cli.query( 'drop database if exists ' + dbConfig.database, function( err ) {

    cli.end();

    cb();

  } );

}