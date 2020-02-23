"use strict";

const _ = require('lodash');
const elasticsearch = require('@elastic/elasticsearch');
const moment = require('moment');
const should = require('should');

const appendNextAndLastTiming = require('../utils/appendNextAndLastTiming');
const convertToLocalTimezone = require('../utils/convertToLocalTimezone');
const derelativize = require('../utils/derelativize');
const geoJSON = require('../utils/geoJSON');
const lastTimingEndsIn = require('../utils/lastTimingEndsIn');
const monolingual = require('../utils/monolingualize');
const filterByAccess = require('../utils/filterByAccess');

const config = require('../testconfig');
const Service = require( '../' );
const fixtures = require('./service/parsers/geoJSON.in.json');
const expected = require('./service/parsers/geoJSON.out.json');

const fba = {
  formSchema: require('./fixtures/filterByAccess/formSchema.json'),
  event: require('./fixtures/filterByAccess/event.json')
}

describe('event-search - unit: utils', function() {

  this.timeout( 10000 );

  let client, service;

  before(() => {
    service = Service(config);

    client = service.getConfig().client;
  });

  describe('appendNextAndLastTiming', () => {

    it('returns object decorated with next and last timing', () => {
      const next = {
        begin: _dateStrFromNow(1),
        end: _dateStrFromNow(1),
      },

      last = {
        begin: _dateStrFromNow(3),
        end: _dateStrFromNow(3)
      }

      const { nextTiming, lastTiming } = appendNextAndLastTiming({
        timings: [{
          begin: _dateStrFromNow(-2),
          end: _dateStrFromNow(-2),
        }, {
          begin: _dateStrFromNow(-1),
          end: _dateStrFromNow(-1),
        }, next, {
          begin: _dateStrFromNow(2),
          end: _dateStrFromNow(2),
        }, last]
      });

      nextTiming.should.eql(next);

      lastTiming.should.eql(last);
    });
  });

  describe('other', () => {
    it('geoJSON post parsers transforms search result into geoJSON data', () => {
      geoJSON(fixtures).should.eql(expected);
    });

    it('derelativize - converts relative term with absolute', () => {
      const query = derelativize({
        date: {
          gte: 'today',
          timezone: 'Europe/Paris'
        }
      });

      (query.date.gte instanceof Date).should.equal(true);
    });
  });

  describe('monolingual', () => {

    it('if an empty array is provided, filter is not applied', () => {
      const h = monolingual.bind(null, [ 'title' ], []);

      const result = h({
        title: {
          fr: 'La guerre des gaules',
          en: 'War of the Gauls'
        }
      });

      result.should.eql( {
        title: { fr: 'La guerre des gaules', en: 'War of the Gauls' }
      });
    });

    it('returns object with specified fields set from multilingual to monolingual', () => {

      const h = monolingual.bind(null, ['title', 'description', 'registration'], 'fr');

      const result = h({
        title: { fr: 'Gros', en: 'Fat' },
        description: { fr: 'Bonjour', en: 'Hello' },
        registration: null
      });

      result.should.eql({
        title: 'Gros',
        description: 'Bonjour',
        registration: null
      });
    });

    it('following languages are considered as fallback languages', () => {
      const h = monolingual.bind( null, ['title', 'description', 'registration'], ['es', 'en']);

      const result = h({
        title: {
          fr: 'Un cheval',
          es: 'Un caballo',
          en: 'A horse'
        },
        description: {
          fr: 'Une vache',
          en: 'A cow'
        }
      });

      result.should.eql({
        title: 'Un caballo',
        description: 'A cow'
      });
    });

    it('unset field is ignored', () => {
      const h = monolingual.bind(null, ['title', 'description'], ['es', 'en']);

      h({
        title: { es: 'La luna llena' }
      }).should.eql( {
        title: 'La luna llena'
      });
    });

  });

  describe('filterByAccess', () => {

    it('public filters out non public fields', () => {
      const event = filterByAccess(fba.formSchema, 'public', fba.event);

      should(event['particularites']).equal(undefined);
    });

    it('"administrator" access includes administrator read fields', () => {
      const event = filterByAccess(fba.formSchema, 'administrator', fba.event);

      should(event['particularites']).eql([776]);
    });

  });

  describe( 'convertToLocalTimezone', () => {

    it( 'when timings and local timezone are available in event, timings are converted', () => {

      convertToLocalTimezone( {
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

  describe('lastTimingEndsIn', () => {

    it('gives the number of days between now and the time the last timing ends', () => {

      let timings = [{
        start: _dateStrFromNow(4),
        end: _dateStrFromNow(5)
      }, {
        start: _dateStrFromNow(2),
        end: _dateStrFromNow(2)
      }];

      lastTimingEndsIn( { timings } ).should.greaterThan(4);

    } );

  } );

  it( 'gives the number of days between now and the last timing ends also in the past', () => {

    const timings = [ {
      end: _getYesterdayDate( 1 )
    } ];

    lastTimingEndsIn({ timings }).should.equal( -1 );

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
