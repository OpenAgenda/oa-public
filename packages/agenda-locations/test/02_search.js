"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

search = require( '../lib/search' ),

fixtures = require( './fixtures' ),

db = require( '../lib/db' ),

elastic = require( 'elasticsearch' ),

mysql = require( 'mysql' ),

config = require( '../testconfig.js' ),

states = require( '../lib/states' );

describe( 'search - init', () => {

  beforeEach( _clearIndex );

  it( 'index is created if not already existing', done => {

    search.init( config.elasticsearch, ( err, result ) => {

      should( err ).equal( null );

      result.indexCreated.should.equal( true );

      done();

    } );

  } );

} );


describe( 'search - rebuild', function() {

  this.timeout( 10000 );

  before( done => fixtures( 123, done ) );

  before( done => db.init( config.mysql, done ) );

  beforeEach( ( done ) => {

    search.setPrimaryDb( db );

    search.init( config.elasticsearch, done );

  } );

  it( 'rebuild indexes all locations', done => {

    _countDbLocations( ( err, count ) => {

      search.rebuild( ( err, result ) => {

        should( err ).equal( null );

        result.indexedCount.should.equal( count );

        done();

      } );

    } );

  } );

} );


describe( 'search - search', function() {

  this.timeout( 10000 );

  before( done => {

    fixtures( 123, done );

  } );

  before( done => {

    fixtures( 456, '2', done );

  } );

  before( done => {

    db.init( config.mysql, done );

  } );

  before( done => {

    search.setPrimaryDb( db );

    search.init( config.elasticsearch, done );

  } );

  before( done => {

    search.rebuild( ( err ) => {

      done();

    } )

  }  );

  it( 'agendaId query', done => {

    search.list( { agendaId: 123 }, 0, 20, ( err, locations, total ) => {

      locations.forEach( l => l.agendaId.should.equal( 123 ) );

      search.list( { agendaId: 456 }, 0, 20, ( err, locations, total ) => {

        locations.forEach( l => l.agendaId.should.equal( 456 ) );

        done();

      } );

    } );

  } );

  it( 'search query on city name', done => {

    search.list( { search: 'La Rochelle' }, 0, 20, ( err, locations, total ) => {

      total.should.equal( 1 );

      done();

    } );

  } );

  it( 'search query on updatedAt', done => {

    search.list( {}, 0, 1, ( err, locations ) => {

      let soon = new Date();

      soon.setHours( soon.getHours() + 1 );

      locations[ 0 ].updatedAt = soon;

      search.update( locations[ 0 ], { refreshUpdatedAt: false, refresh: true }, ( err, l ) => {

        let nowish = new Date();

        nowish.setMinutes( nowish.getMinutes() + 1 );

        search.list( { updatedAt: { $gte: nowish } }, 0, 1, ( err, locations, total ) => {

          total.should.equal( 1 );

          done();

        } );

      } );

    } );

  } );

  it( 'search query on uids', done => {

    search.list( { uids: [ 38584748, 20507930, 79938559 ] }, 0, 10 , ( err, locations, total ) => {

      total.should.equal( 3 );

      done();

    } );

  } );

  it( 'total on uids query', done => {

    search.count( { uids: [ 38584748, 20507930, 79938559 ] }, ( err, total ) => {

      should( err ).equal( null );

      total.should.equal( 3 );

      done();

    } );

  } );

  it( 'total on verified state', done => {

    search.count( { state: states.unverified }, ( err, total ) => {

      should( err ).equal( null );

      total.should.equal( 3 );

      done();

    } );

  } );

  it( 'search query on postal code and agendaId', done => {

    search.list( {
      search: 'Villette',
      agendaId: 123,
    }, 0, 20, ( err, locations, total ) => {

      total.should.equal( 1 );

      done();

    } );

  } );

  it( 'geolocated search', done => {

    search.list( {
      box: {
        topLeft: [ 43.65, 3.79 ],
        bottomRight: [ 43.569, 3.951 ]
      }
    }, 0, 20, ( err, locations, total ) => {

      should( err ).equal( null );

      total.should.equal( 1 );

      done();

    } );

  } );

} );


describe( 'search - create, update, remove', function() {

  this.timeout( 60000 );

  before( done => {

    fixtures( 123, done );

  } );

  before( done => {

    db.init( config.mysql, done );

  } );

  before( ( done ) => {

    search.setPrimaryDb( db );

    search.init( config.elasticsearch, done );

  } );

  beforeEach( ( done ) => {

    search.rebuild( err => {

      done();

    } )

  }  );

  it( 'clear clears all items related to an agendaId', done => {

    search( {}, 0, 20, ( err, locations, total ) => {

      search.clear( 123, ( err, removedCount ) => {

        removedCount.should.equal( total );

        search( {}, 0, 20, ( err, locations, total ) => {

          total.should.equal( 0 );

          done();

        } );

      } )

    } );

  } );

  it( 'updates a value in index', ( done ) => {

    search( {}, 0, 20, ( err, locations ) => {

      var l = locations[ 0 ], id = l.id;

      l.name = 'Hot Giggity';

      l.city = 'Candy Fudge Town';

      search.update( l, { refresh: true }, ( err, result ) => {

        search( { id: l.id }, 0, 3, ( err, locations ) => {

          locations.length.should.equal( 1 );

          locations[ 0 ].name.should.equal( l.name );

          locations[ 0 ].city.should.equal( l.city );

          done();

        } );

      } );

    } );

  } );


  it( 'removes a value in index', ( done ) => {

    search( {}, 0, 20, ( err, locations ) => {

      var l = locations[ 0 ], uid = l.uid;

      search.remove( l, { refresh: true }, ( err, removed ) => {

        should( err ).equal( null );

        removed.should.equal( true );

        search( { id: l.uid }, 0, 3, ( err, locations ) => {

          locations.length.should.equal( 0 );

          done();

        } );

      } );

    } );

  } );


  it( 'creates a value in index', done => {

    var newLocation = {
      id: 98765,
      uid: 1234,
      name: 'Yeepeehoo',
      address: 'Yeehaaw',
      city: 'Corrall',
      latitude: 12.3,
      longitude: 45.6
    };

    search.create( newLocation, { refresh: true }, ( err, result ) => {

      search( { id: newLocation.id }, 0, 3, ( err, ls ) => {

        ls.length.should.equal( 1 );

        let l = ls[ 0 ];

        [ 'id', 'uid', 'name', 'address', 'city', 'latitude', 'longitude' ].forEach( f => {

          l[ f ].should.equal( newLocation[ f ] );

        } );

        done();

      } );

    } );

  } );


  it( 'resync removes ghost values', done => {

    db.remove( { uid: 47303599 }, err => {

      search( {}, 0, 1, ( err, locations, total ) => {

        total.should.equal( 151 );

        search.resync( 123, err => {

          search( {}, 0, 1, ( err, locations, total ) => {

            total.should.equal( 150 );

            done();

          } );

        } );

      } );

     } );

  } );

} );


function _countDbLocations( cb ) {

  var con = mysql.createConnection( config.mysql );

  con.query( `select count( id ) as cnt from ${config.mysql.table}`, ( err, rows ) => {

    con.end();

    cb( null, rows[ 0 ].cnt );

  } );

}


function _clearIndex( done ) {

  var connect = JSON.parse( JSON.stringify( {
    host: config.elasticsearch.host,
    port: config.elasticsearch.port,
    log: [ {
      type: 'stdio',
      level: [ 'error', 'warning' ]
    } ]
  } ) ),

  client = new elastic.Client( connect ).indices.delete( {
    index: config.elasticsearch.index
  }, () => done() );

}
