"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const config = require( '../testconfig' );

const events = require( '@openagenda/events/test/service' );
const contributors = require( './service/contributors' );

const custom = JSON.parse( fs.readFileSync( __dirname + '/service/custom.json', 'utf-8' ) );
const service = require( '../' );

describe( 'event search - functional: search', function() {

  describe( 'simple', function() {

    this.timeout( 20000 );

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
      function eventsList( offset, limit ) {

        return events.list( offset, limit, {
          internal: true,
          detailed: true
        } ).then( r => r.events.map( e => {

          e.contributor = contributors[ i ];

          e.contributor.uid = i++;

          return e;

        } ) );

      }

      await service( 'simple_search' ).rebuild( { eventsList } );

    } );

    it( 'an event can be retrieved by uid', async () => {

      const { events, total } = await service( 'simple_search' ).search( { uid: 6 } );

      total.should.equal( 1 );

      events[ 0 ].slug.should.equal( 'decouverte-du-handball-et-valorisation-du-mondial-de-handball' );

    } );

    it( 'by default, only fields defined in service/config base fields are returned', async () => {

      const { events, total } = await service( 'simple_search' ).search( { uid: 6 } );

      _.keys( events[ 0 ] ).should.eql( [ 'uid', 'image', 'contributor', 'keywords', 'dateRange', 'location', 'title', 'agenda', 'slug', 'lastTiming', 'nextTiming' ] );

    } );

    it( 'by default, event timings are converted to local timezone', async () => {

      const { events, total } = await service( 'simple_search' ).search( { uid: 6 }, null, { detailed: true } );

      events[ 0 ].timings[ 0 ].begin.should.equal( '2016-10-24T14:00:00+02:00' );

    } );

    it( 'by default, undetailed search returns location name, address, latitude and longitude', async () => {

      const { events, total } = await service( 'simple_search' ).search( { uid: 6 } );

      _.keys( events[ 0 ].location ).sort().should.eql( [ 'address', 'latitude', 'longitude', 'name' ] );

    } );

    it( 'if geojson option is set, location data can be formatted in geojson format', async () => {

      const { events, total } = await service( 'simple_search' ).search( { uid: 6 }, null, {
        geojson: true
      } );

      events[ 0 ].location.should.eql( {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ 48.8675959, 2.3516408 ]
        },
        properties: {
          address: '29 passage du Ponceau, Paris',
          latitude: 48.8675959,
          name: 'La boutique',
          longitude: 2.3516408 
        }
      } );

    } );

    it( 'if monolingual option is set, multilingal fields are flattened to specified language', async () => {

      const { events, total } = await service( 'simple_search' ).search( { uid: 6 }, null, {
        monolingual: 'fr',
        detailed: true
      } );

      [
        'title',
        'description',
        'dateRange',
        'country',
        'longDescription'
      ].map( f => events[ 0 ][ f ] ).forEach( data => {

        ( typeof data ).should.equal( 'string' );

      } );

    } );

    it( 'all fields are returned when detailed option is true', async () => {

      let { events, total } = await service( 'simple_search' ).search( { uid: 6 }, null, { detailed: true } );

      Object.keys( events[ 0 ] ).should.eql( [ 
        'longDescription',
        'country',
        'image',
        'private',
        'keywords',
        'accessibility',
        'dateRange',
        'timezone',
        'description',
        'title',
        'agenda',
        'locationUid',
        'uid',
        'createdAt',
        'creatorUid',
        'contributor',
        'draft',
        'timings',
        'registration',
        'location',
        'slug',
        'age',
        'updatedAt',
        'lastTiming',
        'nextTiming'
      ] );

    } );


    it( 'several events can be retrieved by uid at once', async () => {

      let { events, total } = await service( 'simple_search' ).search( { uid: [ 6, 11 ] } );

      total.should.equal( 2 );

      events.map( e => e.slug ).should.eql( [ 'decouverte-du-handball-et-valorisation-du-mondial-de-handball', 'serres-la-claranda-cafe-citoyen' ] );

    } );


    it( 'open search one or more words', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Mississipi' } );

      total.should.equal( 3 );

      events.map( e => e.slug ).should.eql( [ 'multi_1', 'multi_3', 'multi_2' ] );

    } );


    it( 'open search on a city name', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Quimper' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'quimper_event' ] );

    } );

    it( 'open search on country name in french', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Suisse' } );

      total.should.equal( 1 )

      events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

    } );

    it( 'open search on country name in english', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Switzerland' } );

      total.should.equal( 1 )

      events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

    } );


    it( 'country code search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { countryCode: 'CH' } );

      total.should.equal( 1 )

      events.map( e => e.slug ).should.eql( [ 'evenement_suisse' ] );

    } );


    it( 'keyword search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { keyword: 'word' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'keyword_event' ] );

    } );


    it( 'keywords search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { keyword: [ 'autre', 'clé' ] } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'keyword_event_2' ] );

    } );


    it( 'lang search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { lang: 'de' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'german_event' ] );

    } );


    it( 'region search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { region: 'Auvergne-Rhône-Alpes' } );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'rhone_region_event' ] );

    } );
    

    it( 'regions search', async () => {

      let { events, total } = await service( 'simple_search' ).search( { region: [ 'Auvergne-Rhône-Alpes', 'New York' ] } );

      total.should.equal( 2 );

      events.map( e => e.slug ).should.eql( [ 'new_york_event', 'rhone_region_event' ] );

    } );

    describe( 'local time', async () => {

      it( 'not filtered', async () => {

        const query = {
          // subset of fixtures for local time tests
          keyword: 'local_time'
        }

        let { total } = await service( 'simple_search' ).search( query );

        total.should.equal( 2 );

      } );

      it( 'before 11am', async () => {

        const query = {
          keyword: 'local_time',
          localTime: {
            lte: 11*60*60
          }
        };

        let { total } = await service( 'simple_search' ).search( query );

        total.should.equal( 0 );

      } );

      it( 'after 11am', async () => {

        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11*60*60
          }
        };

        let { total } = await service( 'simple_search' ).search( query );

        total.should.equal( 2 );

      } );

      it( 'after 11am, before 12am', async () => {

        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11*60*60,
            lte: 12*60*60
          }
        };

        let { total, events } = await service( 'simple_search' ).search( query );

        total.should.equal( 1 );

        events[ 0 ].slug.should.equal( 'local_time_1' );

      } );

      it( 'after 12am', async () => {

        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 12*60*60
          }
        };

        let { total, events } = await service( 'simple_search' ).search( query );

        total.should.equal( 1 );

        events[ 0 ].slug.should.equal( 'local_time_2' );

      } );

    } );


    describe( 'date', () => {

      it( 'not filtered', async () => {

        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event'
        }

        let { total } = await service( 'simple_search' ).search( query );

        total.should.equal( 2 );

      } );

      it( 'after 2000', async () => {

        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          date: {
            gte: '2000-01-01T00:00:00.000Z'
          }
        }

        let { total, events } = await service( 'simple_search' ).search( query );

        total.should.equal( 1 );

        events[ 0 ].slug.should.equal( 'date_2' );

      } );

      it( 'before 2000', async () => {

        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          date: {
            lte: '2000-01-01T00:00:00.000Z'
          }
        }

        let { total, events } = await service( 'simple_search' ).search( query );

        total.should.equal( 1 );

        events[ 0 ].slug.should.equal( 'date_1' ); 

      } );

      it( 'relative search: greater than today', async () => {

        let { total, events } = await service( 'simple_search' ).search( {
          search: 'Trié',
          date: {
            gte: 'today',
            timezone: 'Europe/Paris'
          }
        } );

        total.should.equal( 3 );

      } );

    } );


    describe( 'aggregation', () => {

      it( 'keyword search, with aggregation', async () => {

        let { aggregations } = await service( 'simple_search' ).search( { 
          keyword: 'word' 
        }, { size: 0 }, {
          aggregations: [ {
            type: 'terms',
            field: 'search_internals_keywords'
          }, {
            type: 'timings'
          } ]
        } );

        aggregations.should.eql( { 
          search_internals_keywords: [ 
            { key: 'clé', count: 1 },
            { key: 'key', count: 1 },
            { key: 'mot', count: 1 },
            { key: 'word', count: 1 }
          ],
          timings: [ { 
            key: '2010-04-01', count: 2 
          } ] 
        } );

      } );


      it( 'timing aggregation: search is bounded by current month', async () => {

        let { aggregations, total } = await service( 'simple_search' ).search( {
          keyword: 'word'
        }, { size: 0 }, {
          aggregations: [ {
            type: 'timingsReverseHits'
          } ]
        } );

        total.should.equal( 1 );

        // one day for each. Depends of the month
        aggregations.timingsReverseHits.length.should.aboveOrEqual( 28 );
        aggregations.timingsReverseHits.length.should.belowOrEqual( 31 );

        aggregations.timingsReverseHits.filter( h => h.count !== 0 ).length.should.equal( 0 );

      } );


      it( 'timing aggregation: keyword search with results', async () => {

        let { aggregations, events } = await service( 'simple_search' ).search( {
          date: {
            gte: new Date( '2010-04-01' ),
            lte: new Date( '2010-04-30' )
          },
          keyword: 'word'
        }, { size: 0 }, {
          aggregations: [ {
            type: 'timingsReverseHits'
          } ]
        } );

        aggregations.timingsReverseHits.length.should.equal( 30 );

        aggregations.timingsReverseHits[ 0 ].count.should.equal( 1 );

        aggregations.timingsReverseHits[ 0 ].sampleEvents[ 0 ].uid.should.equal( 14 ); 

      } );
      

      it( 'reverse timing aggregation parses sample events', async () => {

        let { aggregations, events } = await service( 'simple_search' ).search( {
          date: {
            gte: new Date( '2010-04-01' ),
            lte: new Date( '2010-04-30' )
          },
          keyword: 'word'
        }, { size: 0 }, {
          aggregations: [ {
            type: 'timingsReverseHits'
          } ]
        } );

        const sampleEvent = aggregations.timingsReverseHits[ 0 ].sampleEvents[ 0 ];

        should( sampleEvent.timings ).equal( undefined );

        sampleEvent.lastTiming.begin.should.equal( '2010-04-02T00:00:00+02:00' );

      } );

    } );

    describe( 'stream', () => {

      it( 'simple streamed search returns all the events matching the search', async () => {

        const { total } = await service( 'simple_search' ).search();

        const stream = service( 'simple_search' ).search.stream();

        let count = 0;

        stream.on( 'data', event => {

          count++;

        } );

        return new Promise( rs => {

          stream.on( 'end', () => {

            count.should.equal( total );

            rs();

          } );

        } );

      } );

      it( 'streamed events appear in the same order as a regular search', async () => {

        const regularEventUids = ( await service( 'simple_search' ).search( {}, { size: 100 } ) ).events.map( e => e.uid );

        const stream = service( 'simple_search' ).search.stream();

        let i = 0;

        stream.on( 'data', event => {

          event.uid.should.equal( regularEventUids[ i++ ] );

        } );

        return new Promise( rs => stream.on( 'end', rs ) );

      } );


      it( 'buffer loads from elasticsearch can be tracked with "reloading" event', async () => {

        const stream = service( 'simple_search' ).search.stream();

        stream.on( 'data', event => {} );

        stream.on( 'reloading', data => {

          _.keys( data ).should.eql( [ 'cursor', 'total' ] );

        } );

        return new Promise( rs => stream.on( 'end', rs ) );

      } );


      it( 'size of buffer reload chunks can be set in options', async () => {

        const stream = service( 'simple_search' ).search.stream( {}, { size: 1 } );

        stream.on( 'data', event => {} );

        let total, count = 0;

        stream.on( 'reloading', data => {

          total = data.total;

          count++;

        } );

        return new Promise( rs => {

          stream.on( 'end', () => {

            total.should.equal( count + 1 );

            rs();

          } );

        } );

      } );


    } );

    it( 'geolocation filtering', async () => {

      let { events, total } = await service( 'simple_search' ).search( { 
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

      let { events, total } = await service( 'simple_search' ).search( { search: 'Trié' } );

      total.should.equal( 5 );

      events.map( e => e.slug ).should.eql( [
        'nearest_in_the_future_0',
        'almost_furthest_in_the_future_1',
        'furthest_in_the_future_2',
        'nearest_past_event_3',
        'furthest_past_event_4'
      ] );

    } );

    it( 'sorting works in updatedAt asc order', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Trié', sort: 'updatedAt.asc' }, {}, { detailed: true } );

      events.forEach( ( e, i ) => {

        if ( i === 0 ) return;

        e.updatedAt.should.above( events[ i - 1 ].updatedAt );

      } );

    } );


    it( 'sorting works in updatedAt desc order', async () => {

      let { events, total } = await service( 'simple_search' ).search( { search: 'Trié', sort: 'updatedAt.desc' }, {}, { detailed: true } );

      events.forEach( ( e, i ) => {

        if ( i === 0 ) return;

        e.updatedAt.should.below( events[ i - 1 ].updatedAt );

      } );

    } );

    it( 'sorting works as an array as well: descending on city name', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        keyword: 'lieu',
        sort: [
          'location.city.desc'
        ]
      }, {}, { detailed: true } );

      events.map( e => _.pick( e, [ 'location.city' ] ).location.city ).should.eql( [
        'Valence',
        'Quimper',
        'New York',
        'Grandson'
      ] );

    } );

    it( 'sorting works as an array as well: ascending on city name', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        keyword: 'lieu',
        sort: [
          'location.city.asc'
        ]
      }, {}, { detailed: true } );

      events.map( e => _.pick( e, [ 'location.city' ] ).location.city ).should.eql( [
        'Grandson',
        'New York',
        'Quimper',
        'Valence'
      ] );

    } );


    it( 'navigate using from & size returns expected number of events', async () => {

      let { events, total } = await service( 'simple_search' ).search( {}, { from: 0, size: 4 } );

      events.length.should.equal( 4 );

    } );


    it( 'navigate using from & size maintains order', async () => {

      let { events, total } = await service( 'simple_search' ).search( {}, { from: 0, size: 4 } );

      let fourth = events[ 3 ].uid;

      events = ( await service( 'simple_search' ).search( {}, { from: 3, size: 4 } ) ).events;

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

        return events.list( offset, limit, {
          internal: true,
          detailed: true
        } ).then( r => r.events.map( e => {

          e.custom = _.pick( custom[ i ], [
            'organizeremail', 'totalnumberofvisitors', 'authortestimony'
          ] );

          e.contributor = contributors[ i ];

          e.contributor.uid = i++;

          return e;

        } ) );

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

      let { events, total } = await service( 'simple_search' ).search( {
        custom: {
          organizeremail: 'cannes@reedexpo.fr'
        }
      }, {}, { extensions: 'custom' } );

      total.should.equal( 1 );

    } );
    

    it( 'flat form works as well', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        'custom.organizeremail' : 'cannes@reedexpo.fr'
      }, {}, { extensions: 'custom' } );

      total.should.equal( 1 );

    } );


    it( 'extension data is not part of detailed result by default', async () => {
 
      let { events, total } = await service( 'simple_search' ).search( {
        'uid' : 15
      }, {}, { detailed: true } );

      _.keys( events[ 0 ] ).includes( 'custom' ).should.equal( false );

    } );


    it( 'extension data is part of result only if explicitely requested in options', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        'custom.organizeremail' : 'cannes@reedexpo.fr'
      }, {}, { detailed: true, extensions: [ 'custom', 'contributor' ] } );

      _.keys( events[ 0 ] ).includes( 'custom' ).should.equal( true );

    } );


    it( 'events from a specific agenda can be retrieved based on the agenda uid', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        agendaUid : 21475128
      }, {}, { detailed: true } );

      events[ 0 ].agenda.uid.should.equal( 21475128 );

    } );


    it( 'extension data can be merged into new object as specified in options', async () => {

      let { events, total } = await service( 'simple_search' ).search( {
        'custom.organizeremail' : 'cannes@reedexpo.fr'
      }, {}, { 
        detailed: true, 
        extensions: [ 'custom', 'contributor' ], 
        merge: {
          mergedExtended: [ 'custom', 'contributor' ]
        }
      } );

      _.keys( events[ 0 ] ).includes( 'mergedExtended' ).should.equal( true );

      _.keys( events[ 0 ] ).includes( 'custom' ).should.equal( false );

      _.keys( events[ 0 ] ).includes( 'contributor' ).should.equal( false );

    } );

  } );

} );