"use strict";

const should = require( 'should' );
const helpers = require( '../service/helpers' );
const Service = require( '../' );
const elasticsearch = require( 'elasticsearch' );
const config = require( '../testconfig' );
const w = require( 'when' );
const async = require( 'async' );
const _ = require( 'lodash' );
const moment = require( 'moment' );

describe( 'event-search - unit: helpers', function() {

  this.timeout( 10000 );

  let client, service;

  before( () => {

    service = Service(config);

    client = service.getConfig().client;

  } );

  describe( 'createIndexName', () => {

    it( 'created index name contains alias name and current datetime ( name_20170321t1128 )', () => {

      let aliasName = 'name';

      ( new RegExp( '^' + aliasName + '_20[0-9][0-9][0-1][0-9][0-3][0-9]t[0-2][0-9][0-5][0-9]$' ) )

        .test( helpers.createIndexName( aliasName ) ).should.equal( true );

    } );

  } );


  describe( 'appendNextAndLastTiming', () => {

    it( 'returns object decorated with next and last timing', () => {

      const next = {
        begin: _dateStrFromNow( 1 ),
        end: _dateStrFromNow( 1 ),
      },

      last = {
        begin: _dateStrFromNow( 3 ),
        end: _dateStrFromNow( 3 )
      }

      const { nextTiming, lastTiming } = helpers.appendNextAndLastTiming( {
        timings: [ {
          begin: _dateStrFromNow( -2 ),
          end: _dateStrFromNow( -2 ),
        }, {
          begin: _dateStrFromNow( -1 ),
          end: _dateStrFromNow( -1 ),
        }, next, {
          begin: _dateStrFromNow( 2 ),
          end: _dateStrFromNow( 2 ),
        }, last ]
      } );

      nextTiming.should.eql( next );

      lastTiming.should.eql( last );

    } );

  } );


  describe( 'monolingual', () => {

    it( 'if an empty array is provided, filter is not applied', () => {

      const h = helpers.monolingual.bind( null, [ 'title' ], [] );

      const result = h( {
        title: { fr: 'La guerre des gaules', en: 'War of the Gauls' }
      } );

      result.should.eql( {
        title: { fr: 'La guerre des gaules', en: 'War of the Gauls' }
      } );

    } );

    it( 'returns object with specified fields set from multilingual to monolingual', () => {

      const h = helpers.monolingual.bind( null, [ 'title', 'description', 'registration' ], 'fr' );

      const result = h( {
        title: { fr: 'Gros', en: 'Fat' },
        description: { fr: 'Bonjour', en: 'Hello' },
        registration: null
      } );

      result.should.eql( {
        title: 'Gros',
        description: 'Bonjour',
        registration: null
      } );

    } );

    it( 'following languages are considered as fallback languages', () => {

      const h = helpers.monolingual.bind( null, [ 'title', 'description', 'registration' ], [ 'es', 'en' ] );

      const result = h( {
        title: {
          fr: 'Un cheval',
          es: 'Un caballo',
          en: 'A horse'
        },
        description: {
          fr: 'Une vache',
          en: 'A cow'
        }
      } );

      result.should.eql( {
        title: 'Un caballo',
        description: 'A cow'
      } );

    } );

    it( 'unset field is ignored', () => {

      const h = helpers.monolingual.bind( null, [ 'title', 'description' ], [ 'es', 'en' ] );

      h( {
        title: { es: 'La luna llena' }
      } )

      .should.eql( {
        title: 'La luna llena'
      } );

    } );

  } );

  describe( 'geoJSON', () => {

    it( 'geoJSON format is added to data', () => {

      helpers.geoJSON( {
        location: {
          name: 'Somewhere',
          description: 'A description of somewhere',
          latitude: 45,
          longitude: 23
        }
      } )

      .should.eql( {
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [ 45, 23 ]
          },
          properties: {
            name: 'Somewhere',
            description: 'A description of somewhere'
          }
        }
      } );

    } );

  } );


  describe( 'convertToLocalTimezone', () => {

    it( 'when timings and local timezone are available in event, timings are converted', () => {

      helpers.convertToLocalTimezone( {
        timings: [ {
          begin: '2016-10-24T12:00:00.000Z',
          end: '2016-10-24T13:00:00.000Z'
        } ],
        timezone: 'Europe/Paris'
      } )

      .should.eql( {
        timings: [ {
          begin: '2016-10-24T14:00:00+02:00',
          end: '2016-10-24T15:00:00+02:00'
        } ],
        timezone: 'Europe/Paris'
      } );

    } );

  } );

  describe( 'lastTimingEndsIn', () => {

    it( 'gives the number of days between now and the time the last timing ends', () => {

      let timings = [ {
        start: _dateStrFromNow( 4 ),
        end: _dateStrFromNow( 5 )
      }, {
        start: _dateStrFromNow( 2 ),
        end: _dateStrFromNow( 2 )
      } ];

      helpers.lastTimingEndsIn( { timings } ).should.equal( 5 );

    } );

  } );

  it( 'gives the number of days between now and the last timing ends also in the past', () => {

    const timings = [ {
      end: _getYesterdayDate( 1 )
    } ];

    helpers.lastTimingEndsIn( { timings } ).should.equal( -1 );

  } );

} );


function _getYesterdayDate( secondsOffset ) {

  const yesterday = new Date();

  yesterday.setDate( ( new Date() ).getDate() - 1 );

  yesterday.setSeconds( yesterday.getSeconds() + secondsOffset );

  return yesterday;

}

function _dateStrFromNow( count = 0 ) {

  const d = moment().add( count, 'day' ).toDate();

  return JSON.stringify( d ).replace( /"/g, '' );

}
