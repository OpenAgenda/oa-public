'use strict';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const should = require('should');

const config = require('../testconfig');
const Service = require('../');

describe('03 - event search - functional: search', function() {

  describe( 'simple', function() {
    let service;

    this.timeout(20000);

    before(async () => {
      service = Service(config);

      await service( 'simple_search' ).rebuild({
        eventsList: async (offset, limit) => JSON.parse(
          fs.readFileSync(`${__dirname}/fixtures/03_events.${offset}.${limit}.json`)
        )
      });
    } );

    it('keyword search, with aggregation', async () => {
      const { aggregations } = await service( 'simple_search' ).search( {
        keyword: 'word'
      }, { size: 0 }, {
        aggregations: [
          'search_internals_keywords',
          { type: 'timings' }
        ]
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
    });

    it('keyword search with timespan aggregation', async () => {
      const { aggregations, events } = await service( 'simple_search' ).search( {
        keyword: 'word'
      }, { size: 2 }, {
        detailed: true, // timings is not part of standard, if timespan is
        aggregations: [ { type: 'timespan' } ]
      } );

      JSON.stringify(aggregations).should.eql( '{"timespan":{"first":"2010-04-01T14:00:00.000Z","last":"2010-04-01T22:00:00.000Z"}}');
    });

    it('keyword search using predefined aggregation', async () => {
      service = Service(ih( config, {
        predefinedAggregations: {
          $set: {
            keywords: {
              type: 'terms',
              field: 'search_internals_keywords',
              destination: 'keywords'
            }
          }
        }
      }));

      let { aggregations } = await service( 'simple_search' ).search( {
        keyword: 'word'
      }, { size: 1 }, {
        aggregations: 'keywords'
      } );

      aggregations.should.eql({
        keywords: [
          { key: 'clé', count: 1 },
          { key: 'key', count: 1 },
          { key: 'mot', count: 1 },
          { key: 'word', count: 1 }
        ]
      });
    });

    it('search using predefined aggregation on agenda sub-object', async () => {
      service = Service(ih(config, {
        predefinedAggregations: {
          $set: {
            agendas: {
              type: 'objectsAsTerms',
              field: 'search_internals_agenda',
              destination: 'agendas'
            }
          }
        }
      }));

      const { aggregations } = await service('simple_search').search({
        'agendaUid' : [7678678, 21475128]
      }, { size: 0 }, {
        aggregations: 'agendas'
      });

      aggregations.agendas.should.eql([{
        key: '21475128',
        count: 2,
        agenda: {
          uid: '21475128',
          title: 'France Handball 2017'
        }
      }]);
    });
  });

});
