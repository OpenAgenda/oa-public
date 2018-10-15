"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

fixtures = require( './fixtures' ),

svc = require( '../' ),

config = require( '../testconfig.js' ),

mysql = require( 'mysql' );

describe( 'agenda location service', function () {

  this.timeout( 10000 );

  describe( 'remove', () => {

    beforeEach( done => fixtures( 123, done ) );

    beforeEach( done => svc.init( config, done ) );

    beforeEach( done => svc.rebuild( done ) );

    it( 'unlink sets location agenda reference to null', done => {

      const uid = 66638019;

      const con = mysql.createConnection( config.mysql );

      con.query( `select id, uid, agenda_id from ${config.mysql.table} where uid = ?`, uid, ( err, rows ) => {

        should( rows[ 0 ].agenda_id ).not.equal( null );

        svc.unlink( { uid }, ( err, location ) => {

          con.query( `select id, uid, agenda_id from ${config.mysql.table} where uid = ?`, uid, ( err, rows ) => {

            should( rows[ 0 ].agenda_id ).equal( null );

            done();

          } );

        } );

      } );

    } );


    it( 'unlink remvoes the location from search', done => {

      let uid = 66638019;

      svc.list( { uid }, 0, 1, ( err, locations ) => {

        locations.length.should.equal( 1 );

        svc.unlink( { uid }, { refresh: true }, ( err, location ) => {

          svc.list( { uid }, 0, 1, ( err, locations ) => {

            locations.length.should.equal( 0 );

            done();

          } );

        } );

      } );

    } );


    it( 'remove removes the location from search', done => {

      let uid = 66638019;

      svc.list( { uid }, 0, 1, ( err, locations ) => {

        locations.length.should.equal( 1 );

        svc.remove( { uid }, { refresh: true }, ( err, location ) => {

          svc.list( { uid }, 0, 1, ( err, locations ) => {

            locations.length.should.equal( 0 );

            done();

          } );

        } );

      } );

    } );

    it( 'remove removes the location from db', done => {

      let uid = 66638019,

      con = mysql.createConnection( config.mysql );

      con.query( `select id, uid, agenda_id from ${config.mysql.table} where uid = ?`, uid, ( err, rows ) => {

        rows.length.should.equal( 1 );

        svc.remove( { uid }, ( err, location ) => {

          con.query( `select id, uid, agenda_id from ${config.mysql.table} where uid = ?`, uid, ( err, rows ) => {

            rows.length.should.equal( 0 );

            done();

          } );

        } );

      } );

    } );

  } );

  describe( 'get', () => {

    beforeEach( done => fixtures( 123, done ) );

    beforeEach( done => svc.init( config, done ) );

    beforeEach( done => svc.rebuild( done ) );

    it( 'gets an instanciated location object', done => {

      svc.get( { uid: 66638019 }, ( err, location ) => {

        location.uid.should.equal( 66638019 );

        ( typeof location.setImage ).should.equal( 'function' );

        done();

      } );

    } );

    it( 'gets a simple location object', done => {

      svc.get( { uid: 66638019 }, { instanciate: false }, ( err, location ) => {

        should( err ).equal( null );

        location.uid.should.equal( 66638019 );

        ( typeof location.setImage ).should.equal( 'undefined' );

        done();

      } );

    } );

  } );

  describe( 'set', function() {

    beforeEach( done => fixtures( 123, done ) );

    beforeEach( done => svc.init( config, done ) );

    beforeEach( done => svc.rebuild( done ) );

    it( 'simple location set', done => {

      svc.set( {
        agendaId: 123,
        name: 'Boutique OpenAgenda',
        address: '29 passage du ponceau, Paris',
        latitude: 48.8678662,
        longitude: 2.3523243,
        countryCode: 'FR',
        tags: [ { id: 33 } ]
      }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        done();

      } )

    } );

    it( 'simple location copy creates location with new uid', done => {

      const uid = 38584748;

      svc.copy( 123, 456, { uid }, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        result.valid.should.equal( true );

        result.location.uid.should.not.equal( uid );

        done();

      } );

    } );

    it( 'simple location copy adds an entry', done => {

      const con = mysql.createConnection( config.mysql );

      con.query( `select count( id ) as beforeCount from ${config.mysql.table}`, ( err, rows ) => {

        const beforeCount = rows[ 0 ].beforeCount;

        svc.copy( 123, 456, { uid: 38584748 }, ( err, result ) => {

          con.query( `select count( id ) as afterCount from ${config.mysql.table}`, ( err, rows ) => {

            const afterCount = rows[ 0 ].afterCount;

            afterCount.should.equal( beforeCount + 1 );

            con.end();

            done();

          } );  

        } );

      } );

    } );

  } );

  describe( 'merging locations', function() {

    this.timeout( 10000 );

    // picked from first fixtures file
    const mergeUids = [ 11552251, 27330589, 29935462, 39690484 ];

    beforeEach( done => fixtures( 123, done ) );

    beforeEach( done => svc.init( config, done ) );

    beforeEach( done => svc.rebuild( done ) );

    it( 'merge applies changes to merged location', done => {

      svc.merge( {
        name: 'Merged',
        address: 'the merged address'
      }, { 
        agendaId: 123, 
        uids: mergeUids 
      }, ( err, result ) => {

        should( err ).equal( null );

        result.location.name.should.equal( 'Merged' );

        result.location.address.should.equal( 'the merged address' );

        done();

      } );

    } );


    it( 'merge reduces the total of locations by the number of merged minus 1', done => {

      svc.list( {}, 0, 10, ( err, items, total ) => {

        svc.merge( {}, { uids: mergeUids }, err => {

          svc.list( {}, 0, 10, ( err, items, newTotal ) => {

            total.should.equal( newTotal + mergeUids.length - 1  );

            done();

          } );

        } );

      } );

    } );


    it( 'list locations with all fields', done => {

      svc.list( {}, 0, 10, { fromDb: true, keepId: true }, ( err, items, total ) => {

        Object.keys( items[ 0 ] ).should.eql( [ 
          'id',
          'uid',
          'eveId',
          'agendaId',
          'slug',
          'name',
          'address',
          'city',
          'region',
          'department',
          'postalCode',
          'insee',
          'countryCode',
          'district',
          'latitude',
          'longitude',
          'updatedAt',
          'store',
          'image',
          'description',
          'tags',
          'website',
          'phone',
          'links',
          'access',
          'state',
          'timezone',
          'imageCredits' 
        ] );

        done();

      } );

    } );


    it( 'list locations without internal fields', done => {

      svc.list( {}, 0, 10, { internal: false, fromDb: true }, ( err, items, total ) => {

        Object.keys( items[ 0 ] ).should.eql( [ 
          'uid',
          'slug',
          'name',
          'address',
          'city',
          'region',
          'department',
          'postalCode',
          'insee',
          'countryCode',
          'district',
          'latitude',
          'longitude',
          'updatedAt',
          'image',
          'description',
          'tags',
          'website',
          'phone',
          'links',
          'access',
          'state',
          'timezone',
          'imageCredits' 
        ] );

        done();

      } );

    } );


    it( 'list locations without detailed fields', done => {

      svc.list( {}, 0, 10, { detailed: false, fromDb: true }, ( err, items, total ) => {

        Object.keys( items[ 0 ] ).should.eql( [ 
          'uid',
          'eveId',
          'agendaId',
          'slug',
          'name',
          'address',
          'city',
          'insee',
          'countryCode',
          'district',
          'latitude',
          'longitude',
          'image',
          'timezone' 
        ] );

        done();

      } );

    } );


    it( 'first location provided by merge is used as merged location', done => {

      svc.merge( {}, { uids: mergeUids }, ( err, result ) => {

        result.location.uid.should.equal( mergeUids[ 0 ] );

        done();

      });

    } );

  } );

} );
