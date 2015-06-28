"use strict";

var should = require( 'should' ),

mysql = require( 'mysql' ),

creds = require( './lib/creds' ),

dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'grut',
  database: 'emailstrategietest'
},

lib = require( '../' ),

itf = require( '../lib/interface' ),

async = require( 'async' );

describe( 'Create & delete account', function() {

  var account;

  beforeEach( _dropDb );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: {} // defaults
    } );

    lib.linkAccount( creds.login, creds.password, function( err, a ) {

      account = a;

      done();

    } );

  });

  it( 'unlink', function( done ) {

    var cli = _cli();

    cli.query( 'select id from account where id = ?', account.id, function( err, rows ) {

      rows.length.should.equal( 1 );

      account.unlink( function( err ) {

        should( err ).equal( null );

        cli.query( 'select id from account where id = ?', account.id, function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        });

      });

    }); 

  });

});


describe( 'Create, clear and remove list', function() {

  this.timeout( 10000 );

  var account, list;

  beforeEach( _dropDb );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: {} // defaults
    } );

    lib.linkAccount( creds.login, creds.password, function( err, a ) {

      account = a;

      done();

    } );

  });

  afterEach( function( done ) {

    if ( !list ) return done();

    list.remove( done );

  });

  afterEach( function( done ) {

    account.unlink( done );

  });

  it( 'create list', function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, l ) {

      list = l;

      should( err ).equal( null );

      itf.GetListByID( {
        token: list.token,
        listID: list.id
      }, function( err, result ) {

        result.name.should.equal( list.name );

        result.dynamicContentListsID.should.eql( list.id );

        done();

      });

    });

  } );

  it( 'remove list', function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, l ) {

      list = l;

      var listId = list.id;

      list.remove( function( err ) {

        should( err ).equal( null );

        itf.GetListByID( {
          token: list.token,
          listID: list.id
        }, function( err, result ) {

          should( err ).equal( null );

          should( result ).equal( null );

          list = false;

          done();

        } );

      });

    });

  });

  it( 'clear list', function( done ) {

    account.createList( 'test list', [ 't1', 't2', 't3' ], function( err, l ) {

      list = l;

      var listId = list.id;

      list.clear( function( err ) {

        should( err ).equal( null );

        list.getCount( function( err, count ) {

          count.should.equal( 0 );

          done();

        });

      });

    });

  });

} );


describe( 'add and remove items to a list', function() {

  this.timeout( 10000 );

  var account, list;

  beforeEach( _dropDb );

  beforeEach( function( done ) {

    lib.init( {
      database: dbConfig,
      redis: {} // defaults
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

    account.unlink( done );

  });


  it( 'should add an item to the list', function( done ) {

    var itemId = 23;

    list.setItem( itemId, {
      t1: 'huff',
      t2: 'and',
      t3: 'puff'
    }, function( err, result ) {

      should( err ).equal( null );

      result.should.equal( itemId );

      list.getCount( function( err, count ) {

        should( err ).equal( null );

        count.should.equal( 1 );

        done();

      });

    });

  });

  it( 'add an item with apostrophe', function( done ) {

    var itemId = 23;

    list.setItem( itemId, {
      t1: 'hûff',
      t2: 'l\'est',
      t3: 'puff'
    }, function( err, result ) {

      should( err ).equal( null );

      result.should.equal( itemId );

      list.getCount( function( err, count ) {

        should( err ).equal( null );

        count.should.equal( 1 );

        done();

      });

    });

  });

  it( 'should add two items to the list', function( done ) {

    var idInc = 1;

    async.eachSeries([
      { t1: 'lest', t2: 'pas', t3: 'communiste' },
      { t1: 'lest', t2: 'pas', t3: 'anti-communiste' },
      { t1: 'lest', t2: 'pas', t3: 'anarchiste' }
    ], function( entry, ecb ) {

      list.setItem( idInc++, entry, function( err, result ) {

        ecb();

      } );

    }, function( err ) {

      should( err ).equal( null );

      list.getCount( function( err, count ) {

        should( err ).equal( null );

        count.should.equal( 3 );

        done();

      });

    });

  });

  it( 'removes an item from the list', function( done ) {

    var itemId = 24;

    list.setItem( itemId, {
      t1: 'ziggy',
      t2: 'played',
      t3: 'guitar'
    }, function( err, result ) {

      list.removeItem( itemId, function( err, result ) {

        list.getCount( function( err, count ) {

          should( err ).equal( null );

          count.should.equal( 0 );

          done();

        });

      });

    });

  });


});


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

function _cli() {

  return mysql.createConnection( dbConfig );

}