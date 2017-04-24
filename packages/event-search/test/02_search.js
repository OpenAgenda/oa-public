"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( 'events-service/test/service' );
const service = require( '../' );

describe( 'event search - functional: search', function() {

  describe( 'simple search', function() {

    this.timeout( 10000 );

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql' 
      } ], { reset: true }, done );

    } );

    before( done => {

      service.init( config );

      // list must be prepared to give all needed data
      // for index
      function list( offset, limit, cb ) {

        events.list( offset, limit, {
          internal: true,
          detailed: true
        }, cb );

      }

      service( 'simple_search' ).rebuild( {
        eventsList: list
      }, done );

    } );

    it( 'an event can be retrieved by uid', done => {

      service( 'simple_search' ).search( { uid: 6 }, ( err, events, total ) => {

        total.should.equal( 1 );

        events[ 0 ].slug.should.equal( 'decouverte-du-handball-et-valorisation-du-mondial-de-handball' );

        done();

      } );

    } );


    it( 'several events can be retrieved by uid at once', done => {

      service( 'simple_search' ).search( { uid: [ 6, 11 ] }, ( err, events, total ) => {

        total.should.equal( 2 );

        events.map( e => e.slug ).should.eql( [ 'decouverte-du-handball-et-valorisation-du-mondial-de-handball', 'serres-la-claranda-cafe-citoyen' ] );

        done();

      } );

    } );


    it( 'open search one or more words', done => {

      service( 'simple_search' ).search( { search: 'Mississipi' }, ( err, events, total ) => {

        total.should.equal( 3 );

        events.map( e => e.slug ).should.eql( [ 'multi_1', 'multi_3', 'multi_2' ] );

        done();

      } );

    } );


    it( 'open search on a city name', done => {

      service( 'simple_search' ).search( { search: 'Quimper' }, ( err, events, total ) => {

        total.should.equal( 1 );

        events.map( e => e.slug ).should.eql( [ 'quimper_event' ] );

        done();

      } );

    } );

    it( 'open search on country name in french', done => {

      service( 'simple_search' ).search( { search: 'Suisse' }, ( err, events, total ) => {

        total.should.equal( 1 )

        events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

        done();

      } );

    } );

    it( 'open search on country name in english', done => {

      service( 'simple_search' ).search( { search: 'Switzerland' }, ( err, events, total ) => {

        total.should.equal( 1 )

        events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

        done();

      } );

    } );


    it( 'country code search', done => {

      service( 'simple_search' ).search( { countryCode: 'CH' }, ( err, events, total ) => {

        total.should.equal( 1 )

        events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

        done();

      } );

    } );


    it( 'keyword search', done => {

      service( 'simple_search' ).search( { keyword: 'word' }, ( err, events, total ) => {

        total.should.equal( 1 );

        events.map( e => e.slug ).should.eql( [ 'keyword_event' ] );

        done();

      } );

    } );


    it( 'keywords search', done => {

      service( 'simple_search' ).search( { keyword: [ 'autre', 'clé' ] }, ( err, events, total ) => {

        total.should.equal( 1 );

        events.map( e => e.slug ).should.eql( [ 'keyword_event_2' ] );

        done();

      } );

    } );


    it( 'lang search', done => {

      service( 'simple_search' ).search( { lang: 'de' }, ( err, events, total ) => {

        total.should.equal( 1 );

        events.map( e => e.slug ).should.eql( [ 'german_event' ] );

        done();

      } );

    } );


    it( 'region search', done => {

      service( 'simple_search' ).search( { region: 'Auvergne-Rhône-Alpes' }, ( err, events, total ) => {

        total.should.equal( 1 );

        events.map( e => e.slug ).should.eql( [ 'rhone_region_event' ] );

        done();

      } );

    } );
    

    it( 'regions search', done => {

      service( 'simple_search' ).search( { region: [ 'Auvergne-Rhône-Alpes', 'New York' ] }, ( err, events, total ) => {

        total.should.equal( 2 );

        events.map( e => e.slug ).should.eql( [ 'new_york_event', 'rhone_region_event' ] );

        done();

      } );

    } );


    it( 'geolocation filtering', done => {

      service( 'simple_search' ).search( { 
        geo: {
          northEast: {
            lat: 50,
            lng: 5.5
          },
          southWest: {
            lat: 49,
            lng: 5
          }
        }
      }, ( err, events, total ) => {

        total.should.equal( 1 );

        events.map( e => e.slug ).should.eql( [ 'verdun_bound_box' ] );

        done();

      } );

    } );


    it( 'sorting can show in order upcoming first and past second, then nearest from now first', done => {

      service( 'simple_search' ).search( {
        search: 'Trié'
      }, ( err, events, total ) => {

        total.should.equal( 5 );

        events.map( e => e.slug ).should.eql( [
          'nearest_in_the_future_0',
          'almost_furthest_in_the_future_1',
          'furthest_in_the_future_2',
          'nearest_past_event_3',
          'furthest_past_event_4'
        ] );

        done();

      } );

    } );


    it( 'navigate using from & size returns expected number of events', done => {

      service( 'simple_search' ).search( {}, { from: 0, size: 4 }, ( err, events, total ) => {

        events.length.should.equal( 4 );

        done();

      } );

    } );


    it( 'navigate using from & size maintains order', done => {

      service( 'simple_search' ).search( {}, { from: 0, size: 4 }, ( err, events, total ) => {

        let fourth = events[ 3 ].uid;

        service( 'simple_search' ).search( {}, { from: 3, size: 4 }, ( err, events, total ) => {

          events[ 0 ].uid.should.equal( fourth );

          done();

        } );

      } );

    } );


  } );

} );