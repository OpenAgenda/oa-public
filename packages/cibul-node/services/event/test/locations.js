"use strict";

/**
 * getEventCount
 * locationWillRemove
 * locationDidUpdate
 * locationsWillMerge
 */

process.env.NODE_ENV = 'test';

var svc = require( '../' ),

cbm = require( '../../model' ),

should = require( 'should' ),

async = require( 'async' );

describe( 'event location notifiers', function() {

  this.timeout( 10000 );

  var userId, locationIds = [], eventIds = [];

  beforeEach( done => {

    cbm.fixtures.clearAll( done );

  } );

  beforeEach( done => {

    cbm.lib.query( `insert into user ( uid, email ) values ( 123, 'kaore@openagenda.com' )`, ( err, result ) => {

      userId = result.insertId;

      done();

    } );

  } );

  beforeEach( done => {

    async.eachSeries( [
      `insert into location ( owner_id, slug, placename, address, latitude, longitude ) values ( ${userId}, '1', 'somewhere', 'overtheocean', 12, 34 )`,
      `insert into location ( owner_id, slug, placename, address, latitude, longitude ) values ( ${userId}, '2', 'somewhereelse', 'overtherainbow', 56, 78 )`,
      `insert into location ( owner_id, slug, placename, address, latitude, longitude ) values ( ${userId}, '3', 'blob', 'overtherainbow', 56, 78 )`,
      `insert into location ( owner_id, slug, placename, address, latitude, longitude ) values ( ${userId}, '4', 'dolt', 'overtherainbow', 56, 78 )`,
      `insert into location ( owner_id, slug, placename, address, latitude, longitude ) values ( ${userId}, '5', 'train', 'overtherainbow', 56, 78 )`
    ], cbm.lib.query, ( err, result ) => {

      cbm.lib.query( 'select id from location', ( err, rows ) => {

        locationIds = rows.map( r => r.id );

        done();

      } );

    } );

  } );

  beforeEach( done => {

    async.eachSeries( [
      `insert into event ( owner_id, slug, is_new ) values ( ${userId}, 'a', 0 )`,
      `insert into event ( owner_id, slug, is_new ) values ( ${userId}, 'b', 0 )`,
      `insert into event ( owner_id, slug, is_new ) values ( ${userId}, 'c', 0 )`,
      `insert into event ( owner_id, slug, is_new ) values ( ${userId}, 'd', 0 )`,
      `insert into event ( owner_id, slug, is_new ) values ( ${userId}, 'e', 0 )`,
      `insert into event ( owner_id, slug, is_new ) values ( ${userId}, 'f', 0 )`
    ], cbm.lib.query, ( err, result ) => {

      cbm.lib.query( 'select id from event', ( err, rows ) => {

        eventIds = rows.map( r => r.id );

        done();

      } );

    } );

  } );

  beforeEach( done => {

    async.eachSeries( [
      `insert into event_translation ( id, title ) values ( ${eventIds[ 0 ]}, 'a' )`,
      `insert into event_translation ( id, title ) values ( ${eventIds[ 1 ]}, 'b' )`,
      `insert into event_translation ( id, title ) values ( ${eventIds[ 2 ]}, 'c' )`,
      `insert into event_translation ( id, title ) values ( ${eventIds[ 3 ]}, 'd' )`,
      `insert into event_translation ( id, title ) values ( ${eventIds[ 4 ]}, 'e' )`,
      `insert into event_translation ( id, title ) values ( ${eventIds[ 5 ]}, 'f' )`
    ], cbm.lib.query, () => done() );

  } );

  beforeEach( done => {

    async.eachSeries( [
      `insert into event_location ( location_id, event_id ) values ( ${locationIds[ 0 ]}, ${eventIds[ 0 ]} )`,
      `insert into event_location ( location_id, event_id ) values ( ${locationIds[ 0 ]}, ${eventIds[ 1 ]} )`,
      `insert into event_location ( location_id, event_id ) values ( ${locationIds[ 0 ]}, ${eventIds[ 2 ]} )`,
      `insert into event_location ( location_id, event_id ) values ( ${locationIds[ 1 ]}, ${eventIds[ 3 ]} )`,
      `insert into event_location ( location_id, event_id ) values ( ${locationIds[ 1 ]}, ${eventIds[ 4 ]} )`,
      `insert into event_location ( location_id, event_id ) values ( ${locationIds[ 2 ]}, ${eventIds[ 5 ]} )`
    ], cbm.lib.query, () => done() );

  } );

  it( 'getEventCount', done => {

    svc.locations.getEventCount( locationIds[ 0 ], ( err, count ) => {

      count.should.equal( 3 );

      done();

    } );

  } );

  it( 'locationWillRemove - events are removed', done => {

    svc.locations.locationWillRemove( locationIds[ 0 ], ( err, count ) => {

      cbm.lib.query( 'select id from event', ( err, rows ) => {

        rows.length.should.equal( eventIds.length - 3 );

        rows.filter( r => {

          return [ eventIds[ 0 ], eventIds[ 1 ], eventIds[ 2 ] ].indexOf( r.id ) !== -1;

        } ).length.should.equal( 0 );

        done();

      } )

    } );

  } );

  it( 'locationDidUpdate', done => {

    cbm.lib.query( 'select updated_at from event where id = ?', eventIds[ 3 ], ( err, rows ) => {

      var now = new Date();

      now.setMilliseconds( 0 );

      ( rows[ 0 ].updated_at > now ).should.equal( false );

      svc.locations.locationDidUpdate( locationIds[ 1 ], ( err ) => {

        cbm.lib.query( 'select updated_at from event where id = ?', eventIds[ 3 ], ( err, rows ) => {

          ( rows[ 0 ].updated_at >= now ).should.equal( true );

          done();

        } );

      } );

    });

  } );

  it( 'locationsWillMerge - replace location_id for related events', done => {

    svc.locations.locationsWillMerge( locationIds[ 0 ], [ locationIds[ 0 ], locationIds[ 1 ], locationIds[ 2 ] ], ( err ) => {

      cbm.lib.query( 'select location_id from event_location', ( err, rows ) => {

        rows.forEach( r => r.location_id.should.equal( locationIds[ 0 ] ) );

        done();

      } );

    } );

  } );

} );