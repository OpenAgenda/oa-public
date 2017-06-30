"use strict";

const should = require( 'should' );
const fs = require( 'fs' );

const config = require( '../testconfig' );
const events = require( 'events-service/test/service' );
const contributors = require( './service/contributors' );
const custom = JSON.parse( fs.readFileSync( __dirname + '/service/custom.json', 'utf-8' ) );
const service = require( '../' );
const _ = require( 'lodash' );

describe( 'event search - functional: search', function() {

  describe( 'simple', function() {

    this.timeout( 10000 );

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql' 
      } ], { reset: true }, done );

    } );

    before( async () => {

      let i = 0;

      service.init( config );

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit, cb ) {

        events.list( offset, limit, {
          internal: true,
          detailed: true
        }, ( err, events ) => {

          cb( null, events.map( e => {

            e.contributor = contributors[ i ];

            e.contributor.uid = i++;

            return e;

          } ) );

        } );

      }

      await service( 'simple_search' ).rebuild( { eventsList } );

    } );

    it( 'an event can be retrieved by uid', async () => {

      let { events, total } = await service( 'simple_search' ).search( { uid: 6 } );

      total.should.equal( 1 );

      events[ 0 ].slug.should.equal( 'decouverte-du-handball-et-valorisation-du-mondial-de-handball' );

    } );

    it( 'by default, only few fields are returned', async () => {

      let { events, total } = await service( 'simple_search' ).search( { uid: 6 } );

      Object.keys( events[ 0 ] ).should.eql( service.getConfig().baseSearchIncludes );

    } );

    it( 'all fields are returned when detailed option is true', async () => {

      let { events, total } = await service( 'simple_search' ).search( { uid: 6 }, { detailed: true } );

      Object.keys( events[ 0 ] ).should.eql( [ 
        'longDescription',
        'country',
        'private',
        'keywords',
        'accessibility',
        'dateRange',
        'timezone',
        'description',
        'title',
        'uid',
        'createdAt',
        'contributor',
        'draft',
        'timings',
        'id',
        'slug',
        'updatedAt',
        'image',
        'agendaUid',
        'agenda',
        'locationUid',
        'creatorUid',
        'deletedAt',
        'registration',
        'location',
        'ownerUid',
        'age'
      ] );

    } );


    it( 'several events can be retrieved by uid at once', async () => {

      let { events, total } = await service( 'simple_search' ).search( { uid: [ 6, 11 ] } );

      total.should.equal( 2 );

      events.map( e => e.slug ).should.eql( [ 'decouverte-du-handball-et-valorisation-du-mondial-de-handball', 'serres-la-claranda-cafe-citoyen' ] );

    } );


    it( 'open search one or more words', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Mississipi' } );

      total.should.equal( 3 );

      events.map( e => e.slug ).should.eql( [ 'multi_1', 'multi_3', 'multi_2' ] );

    } );


    it( 'open search on a city name', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Quimper' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'quimper_event' ] );

    } );

    it( 'open search on country name in french', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Suisse' } );

      total.should.equal( 1 )

      events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

    } );

    it( 'open search on country name in english', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Switzerland' } );

      total.should.equal( 1 )

      events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

    } );


    it( 'country code search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { countryCode: 'CH' } );

      total.should.equal( 1 )

      events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

    } );


    it( 'keyword search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { keyword: 'word' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'keyword_event' ] );

    } );


    it( 'keywords search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { keyword: [ 'autre', 'clé' ] } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'keyword_event_2' ] );

    } );


    it( 'lang search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { lang: 'de' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'german_event' ] );

    } );


    it( 'region search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { region: 'Auvergne-Rhône-Alpes' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'rhone_region_event' ] );

    } );
    

    it( 'regions search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { region: [ 'Auvergne-Rhône-Alpes', 'New York' ] } );

      total.should.equal( 2 );

      events.map( e => e.slug ).should.eql( [ 'new_york_event', 'rhone_region_event' ] );

    } );


    it( 'geolocation filtering', async () => {

      let { events, total } = await service( 'simple_search' ).search( { 
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
      } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'verdun_bound_box' ] );

    } );


    it( 'sorting can show in order upcoming first and past second, then nearest from now first', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Trié' } );

      total.should.equal( 5 );

      events.map( e => e.slug ).should.eql( [
        'nearest_in_the_future_0',
        'almost_furthest_in_the_future_1',
        'furthest_in_the_future_2',
        'nearest_past_event_3',
        'furthest_past_event_4'
      ] );

    } );


    it( 'navigate using from & size returns expected number of events', async () => {

      let { events, total } = await service( 'simple_search' ).search( {}, {}, { from: 0, size: 4 } );

      events.length.should.equal( 4 );

    } );


    it( 'navigate using from & size maintains order', async () => {

      let { events, total } = await service( 'simple_search' ).search( {}, {}, { from: 0, size: 4 } );

      let fourth = events[ 3 ].uid;

      events = ( await service( 'simple_search' ).search( {}, {}, { from: 3, size: 4 } ) ).events;

      events[ 0 ].uid.should.equal( fourth );

    } );

  } );

  describe( 'custom', function() {

    this.timeout( 10000 );

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql' 
      } ], { reset: true }, done );

    } );

    before( async () => {

      let i = 0;

      service.init( config );

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit, cb ) {

        events.list( offset, limit, {
          internal: true,
          detailed: true
        }, ( err, events ) => {

          cb( null, events.map( e => {

            e.custom = _.pick( custom[ i ], [
              'organizeremail', 'totalnumberofvisitors', 'authortestimony'
            ] );

            e.contributor = contributors[ i ];

            e.contributor.uid = i++;

            return e;

          } ) );

        } );

      }

      await service( 'simple_search' ).rebuild( {
        eventsList,
        extensions: {
          custom: {
            organizeremail: {
              type: 'email'
            },
            totalnumberofvisitors: {
              type: 'integer'
            },
            authortestimony: {
              type: 'text'
            }
          }
        }
      } );

    } );


    it( 'custom field is searched through custom key', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        custom: {
          organizeremail: 'cannes@reedexpo.fr'
        }
      } );

      total.should.equal( 1 );

    } );

    it( 'flat form works as well', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        'custom.organizeremail' : 'cannes@reedexpo.fr'
      } );

      total.should.equal( 1 );

    } );

  } );

} );