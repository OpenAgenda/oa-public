"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const config = require( '../testconfig' );

const events = require( '@openagenda/events/test/service' );
const contributors = require( './service/contributors' );

const custom = JSON.parse( fs.readFileSync( __dirname + '/service/custom.json', 'utf-8' ) );
const service = require( '../' );

const dslSearch = require( '../service/search' ).dsl;

describe( 'event search - functional: more like this', function() {

  this.timeout( 20000 );

  before( done => {

    events.initAndLoad( config.eventService, [ {
      table: 'event',
      src: __dirname + '/service/moreLikeThisEvents.data.sql'
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

        e.custom = custom[ i ];

        e.contributor = contributors[ i ];

        e.contributor.uid = i++;

        return e;

      } ) );

    }

    await service( 'simple_search' ).rebuild( {
      eventsList,
      extensions: {
        custom: {
          multichoice: {
            type: 'integer'
          },
          singlechoice: {
            type: 'integer'
          },
          organizername: {
            type: 'text'
          }
        }
      }
    } );

  } );

  describe( 'dsl more like this', () => {

    it( 'a more like this taken from keywords', async () => {

      /**
       * as seen in 15_ tests, array of values matches only
       * for generic like search.
       */

      const { events } = await dslSearch( 'simple_search', {
        query: {
          mlt: {
            fields: [ 'search_internals_keywords' ],
            min_term_freq: 1,
            min_doc_freq: 1,
            like: [ 'vin chaud' ]
          }
        }
      } );

      events[ 0 ].uid.should.equal( 82 );

    } );

  } );

  describe( 'service more like this', () => {

    it( 'mlt on one keyword', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        keywords: {
          fr: [ 'vin chaud' ]
        }
      } );

      total.should.equal( 2 );

      events.map( e => e.uid )

        // as dataset changes, ordering is not constant.
        .sort( ( e1, e2 ) => e1.id < e2.id )

        .should.eql( [ 82, 57 ] );

    } );

    it( 'mlt on two keywords', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        keywords: {
          fr: [ 'vin chaud', 'bières' ]
        }
      } );

      // still matches event with "vin chaud" keyword only
      total.should.equal( 2 );

      // but event with all keywords comes in first
      events[ 0 ].uid.should.equal( 82 );

    } );

    it( 'mlt on title', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        title: {
          fr: 'Bazar'
        }
      } );

      total.should.equal( 1 );

      events[ 0 ].uid.should.equal( 107 );

    } );

    it( 'mlt on title and keywords', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        title: {
          fr: 'Les doigts de la main'
        },
        keywords: {
          fr: [ 'doigts' ]
        }
      } );

      events.map( e => e.uid ).should.eql( [ 157, 132 ] );

    } );

    it( 'mlt on title and keywords with boosts', async () => {

      const mltRequest = {
        title: {
          fr: 'Les doigts de la main'
        },
        keywords: {
          fr: [ 'doigts' ]
        }
      };

      ( await service( 'simple_search' ).moreLikeThis( mltRequest, { 
        boost: { title: 20, keywords: 30 }
      } ) ).events.map( e => e.uid ).should.eql( [ 157, 132 ] );

      ( await service( 'simple_search' ).moreLikeThis( mltRequest, { 
        boost: { title: 50, keywords: 30 }
      } ) ).events.map( e => e.uid ).should.eql( [ 132, 157 ] );

    } );

    it( 'mlt on nothing should return empty result', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {} );

      total.should.equal( 0 );

      events.length.should.equal( 0 );

    } );

    it( 'mlt on department', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        location: {
          department: 'Finistère'
        }
      } );

      events[ 0 ].location.department.should.equal( 'Finistère' );

    } );


    it( 'mlt on custom option ids', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        custom: {
          singlechoice: 5,
        }
      } );

      events.length.should.equal( 1 );

      events[ 0 ].custom.singlechoice.should.equal( 5 );

    } );


    it( 'mlt on custom option ids and custom text', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        custom: {
          organizername: 'Reed',
          multichoice: 7,
          singlechoice: 5
        }
      } );

      total.should.equal( 5 );

    } );


    it( 'mlt on custom option ids and custom text puts best match first', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        custom: {
          organizername: 'Reed',
          multichoice: 7,
          singlechoice: 5
        }
      } );

      events[ 0 ].custom.organizername.should.equal( 'Reed Expositions France' );

      events[ 0 ].custom.multichoice.includes( 7 ).should.equal( true );

    } );


    it( 'mlt on department with title in different department', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        keywords: {
          fr: [ 'janine' ]
        },
        location: {
          department: 'Finistère'
        }
      }, { boost: { keywords : 10, 'location.department' : 20 } } );

      events.map( e => e.slug ).should.eql( [ 'finger_event_2', 'shop_event_2' ] );

    } );

    it( 'mlt on department with title in different department with different boost', async () => {

      const { total, events } = await service( 'simple_search' ).moreLikeThis( {
        keywords: {
          fr: [ 'janine' ]
        },
        location: {
          department: 'Finistère'
        }
      }, { boost: { keywords : 20, 'location.department' : 10 } } );

      events.map( e => e.slug ).should.eql( [ 'shop_event_2', 'finger_event_2' ] );

    } );

  } );

} );
