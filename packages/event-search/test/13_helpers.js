"use strict";

const should = require( 'should' );
const helpers = require( '../service/helpers' );
const service = require( '../' );
const elasticsearch = require( 'elasticsearch' );
const config = require( '../testconfig' );
const w = require( 'when' );
const async = require( 'async' );
const _ = require( 'lodash' );

describe( 'event-search - unit: helpers', function() {

  this.timeout( 10000 );

  let client;

  before( () => {

    service.init( config );

    client = service.getConfig().client;

  } );

  describe( 'createIndexName', () => {

    it( 'created index name contains alias name and current datetime ( name_20170321T1128 )', () => {

      let aliasName = 'name';

      ( new RegExp( '^' + aliasName + '_20[0-9][0-9][0-1][1-9][0-3][0-9]t[0-2][0-9][0-5][0-9]$' ) )

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

} );

function _dateStrFromNow( count = 0 ) {

  let d = new Date();

  d.setDate( d.getDate() + count );

  return JSON.stringify( d ).replace( /"/g, '' );

}