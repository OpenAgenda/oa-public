'use strict';

const _ = require('lodash');
const fs = require('fs');
const assert = require('assert');
const {
  produce
} = require('immer');

const config = require('../testconfig');

const custom = JSON.parse(fs.readFileSync(__dirname + '/service/custom.json', 'utf-8'));
const Service = require('../');

describe('02 - event search - functional: search', function() {

  describe('simple use cases', function() {
    let service;
    this.timeout(40000);

    before(async () => {
      service = Service(config);

      try {
        await service.getConfig().client.indices.delete({
          index: 'test'
        });
      } catch (e) {}
    });

    before(async () => {
      await service('simple_search').rebuild({
        eventsList: async (lastId, limit) => JSON.parse(
          fs.readFileSync(`${__dirname}/fixtures/02_events.${lastId}.${limit}.json`)
        )
      });
    });

    describe('filtering', () => {
      it('an event can be retrieved by uid', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ uid: 6 });
  
        assert(total === 1);
        assert.equal(
          events[0].slug,
          'decouverte-du-handball-et-valorisation-du-mondial-de-handball'
        );
      });
  
      it('several events can be retrieved by uid at once', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ uid: [6, 11] });
        
        assert(total === 2);

        assert.deepEqual(
          events.map(e => e.slug),
          [
            'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
            'serres-la-claranda-cafe-citoyen'
          ]
        );
      });
  
      it('an event can be retrieved with its slug', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          slug: 'decouverte-du-handball-et-valorisation-du-mondial-de-handball'
        });

        assert.equal(events[0].uid, 6);
      });
  
      it('several events can be retrieved by slug at once', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          slug: [
            'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
            'serres-la-claranda-cafe-citoyen'
        ]
        });
  
        assert(total === 2);
        assert.deepEqual(
          events.map(e => e.uid),
          [6, 11]
        );
      });

      it('country code search', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ countryCode: 'CH' });

        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['evenement_suisse']
        );
      });


      it('keyword search', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ keyword: 'word' });

        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['keyword_event']
        );
      });


      it('keywords search', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ keyword: ['autre', 'clé'] });

        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['keyword_event_2']
        );
      });

      it('lang search', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ lang: 'de' });

        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['german_event']
        );
      });


      it('region search', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          region: 'Ile-de-France'
        }, { size: 100 }, { detailed: true });

        const regions = _.uniq(events.map(e => e.location.region));

        assert.equal(regions.length, 1);

        assert.equal(regions[0], 'Ile-de-France');
      });

      it('regions search', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          region: ['Ile-de-France', 'New York']
        }, { size: 100 }, { detailed: true });

        const regions = _.uniq(events.map(e => e.location.region));

        assert.deepEqual(regions, ['Ile-de-France', 'New York']);
      });
    });

    describe('result', () => {
      it('by default, only fields defined in service/config base fields are returned', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          uid: 6
        });
  
        const postParseFields = ['contributor', 'lastTiming', 'nextTiming'];
  
        const expectedFields = service.getConfig().baseSearchIncludes.concat(postParseFields).map(f => f.split('.')[0]);
  
        assert.deepEqual(
          Object.keys(events[0])
            .filter(field => !expectedFields.includes(field)),
          []
        );
      });
  
      it('by default, event timings are converted to local timezone', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          uid: 6
        }, null, {
          detailed: true
        });

        assert.equal(
          events[0].timings[0].begin,
          '2016-10-24T14:00:00+02:00'
        );
      });
  
      it('by default, undetailed search returns location name, address, latitude and longitude', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          uid: 6
        });
  
        assert.deepEqual(
          Object.keys(events[0].location).sort(),
          ['address', 'latitude', 'longitude', 'name']
        );
      });
  
      it('if monolingual option is set, multilingal fields are flattened to specified language', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ uid: 6 }, null, {
          monolingual: 'fr',
          detailed: true
        });
  
        [
          'title',
          'description',
          'dateRange',
          'country',
          'longDescription'
        ].map(f => events[0][f]).forEach(data => {
          assert.equal(typeof data, 'string');
        });
      });
  
      it('all fields are returned when detailed option is true', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({ uid: 6 }, null, {
          detailed: true
        });

        assert.deepEqual(
          Object.keys(events[0]),
          [
            'longDescription',  'country',
            'private',
            'featured',         'keywords',
            'accessibility',    'dateRange',
            'timezone',         'originAgenda',
            'description',      'title',
            'onlineAccessLink', 'uid',
            'createdAt',        'draft',
            'timings',          'member',
            'state',            'slug',
            'updatedAt',        'image',
            'attendanceMode',   'creatorUid',
            'registration',     'location',      'ownerUid',
            'age',              'lastTiming',
            'nextTiming'
          ]
        );
      });
    });

    describe('search searches', () => {
      it('open search one or more words', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          search: 'Mississipi'
        });
        
        assert.equal(total, 3);
        assert.deepEqual(
          events.map(e => e.slug),
          ['multi_1', 'multi_2', 'multi_3']
        );
      });
  
      it('search on word with apostrophe', async () => {
        const {
          total
        } = await service('simple_search').search({
          search: 'Horreur'
        });
  
        assert.equal(total, 1);
      });

      it('search on word with plural', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          search: 'Horreurs'
        });

        assert.equal(total, 1);
      });
  
      it('open search on a city name', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          search: 'Quimper'
        });
  
        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['quimper_event']
        );
      });

      it('open search on a location name', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          search: 'Cathédrale'
        });

        assert.equal(total, 1);
        assert.equal(events[0].slug, 'quimper_event');
      });
  
      it('open search on country name in french', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          search: 'Suisse'
        });

        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['evenement_suisse']
        );
      });
  
      it('open search on country name in english', async () => {
        const {
          events,
          total
        } = await service('simple_search').search({
          search: 'Switzerland'
        });

        assert.equal(total, 1);
        assert.deepEqual(
          events.map(e => e.slug),
          ['evenement_suisse']
        );
      });

      // the following fields need a "french" analyzer in order for this test to function
      // _search_description
      // _search_full_address_text

      //it('Search prioritizes title field', async () => {
      //  const {
      //    events
      //  } = await service('simple_search').search({
      //    state: null,
      //    search: 'Les chaussettes de l\'Archiduchesse'
      //  }, {
      //    size: 3
      //  });
      //
      //  assert.deepEqual(
      //    events.map(e => e.uid),
      //    [9876, 45747, 9879]
      //  );
      //});
    });

    describe('attendanceMode', () => {

      it('attendanceMode value is 1 (offline) by default', async () => {
        const {
          events
        } = await service('simple_search').search();

        assert.equal(events[0].attendanceMode, 1);
      });

      it('events can by filtered by attendanceMode', async () => {
        const {
          events
        } = await service('simple_search').search({
          attendanceMode: [2, 3]
        });

        assert.equal(events[0].attendanceMode, 2);
      });

      it('onlineAccessLink is present for attendanceMode of 2 and 3', async () => {
        const {
          events
        } = await service('simple_search').search({
          attendanceMode: [2, 3]
        });

        assert.equal(events[0].onlineAccessLink, 'https://webin.ar');
      });
    });

    describe('local time', async () => {

      it('not filtered', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'local_time'
        }

        const { total } = await service('simple_search').search(query);

        assert.equal(total, 2);
      });

      it('before 11am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            lte: 11*60*60
          }
        };

        const { total } = await service('simple_search').search(query);

        assert.equal(total, 0);
      });

      it('after 11am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11*60*60
          }
        };

        let { total } = await service('simple_search').search(query);

        assert.equal(total, 2);
      });

      it('after 11am, before 12am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11*60*60,
            lte: 12*60*60
          }
        };

        let {
          total,
          events
        } = await service('simple_search').search(query);

        assert.equal(total, 1);
        assert.equal(events[0].slug, 'local_time_1');
      });

      it('after 12am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 12*60*60
          }
        };

        const {
          total,
          events
        } = await service('simple_search').search(query);

        assert.equal(total, 1);
        assert.equal(events[0].slug, 'local_time_2');
      });
    });

    describe('date', () => {

      it('not filtered', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event'
        }

        const { total } = await service('simple_search').search(query);

        assert.equal(total, 2);
      });

      it('after 2000', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          timings: {
            gte: '2000-01-01T00:00:00.000Z'
          }
        }

        const { total, events } = await service('simple_search').search(query);

        assert.equal(total, 1);
        assert.equal(events[0].slug, 'date_2');
      });

      it('before 2000', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          timings: {
            lte: '2000-01-01T00:00:00.000Z'
          }
        }

        let { total, events } = await service('simple_search').search(query);

        assert.equal(total, 1);
        assert.equal(events[0].slug, 'date_1');
      });

      it('relative search: greater than today', async () => {
        let { total, events } = await service('simple_search').search({
          search: 'Trié',
          date: {
            gte: 'today',
            timezone: 'Europe/Paris'
          }
        });

        assert.equal(total, 3);
      });

    });


    describe('aggregation', () => {

      it('keyword search, with aggregation', async () => {
        const {
          aggregations
        } = await service('simple_search').search({
          keyword: 'word'
        }, { size: 0 }, {
          aggregations: ['keywords', 'timings']
        });

        assert.deepEqual(aggregations, {
          keywords: [
            { key: 'clé', eventCount: 1 },
            { key: 'key', eventCount: 1 },
            { key: 'mot', eventCount: 1 },
            { key: 'word', eventCount: 1 }
         ],
          timings: [{
            key: '2010-04-01', timingCount: 2
          }]
        });
      });


      it('timing aggregation: search is bounded by current month', async () => {
        let { aggregations, total } = await service('simple_search').search({
          keyword: 'word'
        }, { size: 0 }, {
          aggregations: 'eventsByDateRanges'
        });

        assert.equal(total, 1);

        // one day for each. Depends of the month
        assert(aggregations.eventsByDateRanges.length >= 28);
        assert(aggregations.eventsByDateRanges.length <= 31);
        assert(aggregations.eventsByDateRanges.filter(h => h.eventCount !== 0).length === 0);
      });


      it('timing aggregation: keyword search with results', async () => {
        const {
          aggregations, events
        } = await service('simple_search').search({
          date: {
            gte: new Date('2010-04-01'),
            lte: new Date('2010-04-30')
          },
          keyword: 'word'
        }, { size: 0 }, {
          aggregations: 'eventsByDateRanges'
        });

        assert.equal(aggregations.eventsByDateRanges.length, 30);
        assert.equal(aggregations.eventsByDateRanges[0].eventCount, 1);
        assert.equal(aggregations.eventsByDateRanges[0].sampleEvents[0].uid, 14);
      });

      it('unknown requested aggregation throws not found error', async () => {
        let error;
        try {
          await service('simple_search').search({}, { size: 0 }, { aggregations: 'unknownagg' });
        } catch (e) {
          error = e;
        }
        assert.strictEqual(error.name, 'BadRequest');
        assert.strictEqual(error.code, 400);
      });
    });

    describe('stream', () => {

      it('simple streamed search returns all the events matching the search', async () => {
        const { total } = await service('simple_search').search();

        const stream = service('simple_search').search.stream();

        let count = 0;

        stream.on('data', event => {
          count++;
        });

        return new Promise(rs => {
          stream.on('end', () => {
            assert.equal(count, total);
            rs();
          });
        });
      });

      it('streamed events appear in the same order as a regular search', async () => {
        const regularEventUids = (await service('simple_search').search({}, { size: 100 })).events.map(e => e.uid);

        const stream = service('simple_search').search.stream();

        let i = 0;

        stream.on('data', event => {

          //event.uid.should.equal(regularEventUids[i++]);

        });

        return new Promise(rs => stream.on('end', rs));
      });


      it('buffer loads from elasticsearch can be tracked with "reloading" event', async () => {
        const stream = service('simple_search').search.stream();

        stream.on('data', event => {});

        stream.on('reloading', data => {
          assert.deepEqual(
            Object.keys(data),
            ['cursor', 'total']
          );
        });

        return new Promise(rs => stream.on('end', rs));
      });


      it('size of buffer reload chunks can be set in options', async () => {
        const stream = service('simple_search').search.stream({}, { size: 1 });

        stream.on('data', event => {});

        let total, count = 0;

        stream.on('reloading', data => {
          total = data.total;

          count++;
        });

        return new Promise(rs => {
          stream.on('end', () => {
            assert.equal(total, count+1);
            rs();
          });
        });
      });

    });

    it('geolocation filtering', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
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
      });

      assert.equal(total, 1);
      assert.deepEqual(
        events.map(e => e.slug),
        ['verdun_bound_box']
      );
    });


    it('sorting can show in order upcoming first and past second, then nearest from now first', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Trié',
        sort: 'timings.asc'
      });

      assert.equal(total, 5);
      assert.deepEqual(
        events.map(e => e.slug),
        [
          'nearest_in_the_future_0',
          'almost_furthest_in_the_future_1',
          'furthest_in_the_future_2',
          'nearest_past_event_3',
          'furthest_past_event_4'
      ]);
    });

    it('sorting works in updatedAt asc order', async () => {
      const { events } = await service('simple_search').search({
        search: 'Trié',
        sort: 'updatedAt.asc'
      }, {}, { detailed: true });

      events.forEach((e, i) => {
        if (i === 0) return;
        assert(e.updatedAt >= events[i - 1].updatedAt);
      });
    });


    it('sorting works in updatedAt desc order', async () => {
      const {
        events
      } = await service('simple_search').search({
        search: 'Trié',
        sort: 'updatedAt.desc'
      }, {}, {
        detailed: true
      });

      events.forEach((e, i) => {
        if (i === 0) return;

        assert(e.updatedAt < events[i - 1].updatedAt);
      });
    });

    it('sorting works as an array as well: descending on city name', async () => {
      const {
        events
      } = await service('simple_search').search({
        keyword: 'lieu',
        sort: [
          'location.city.desc'
       ]
      }, {}, { detailed: true });

      assert.deepEqual(
        events.map(e => _.pick(e, ['location.city']).location?.city),
        [
          'Quimper',
          'New York',
          'Grandson',
          undefined // online event
        ]
      );
    });

    it('sorting works as an array as well: ascending on city name', async () => {
      const {
        events
      } = await service('simple_search').search({
        keyword: 'lieu',
        sort: [
          'location.city.asc'
        ]
      }, {}, { detailed: true });

      assert.deepEqual(
        events.map(e => _.pick(e, ['location.city']).location?.city),
        [
          'Grandson',
          'New York',
          'Quimper',
          undefined // online event
        ]
      );
    });


    it('navigate using from & size returns expected number of events', async () => {
      const {
        events
      } = await service('simple_search').search({}, { from: 0, size: 4 });

      assert.equal(events.length, 4);
    });


    it('navigate using from & size maintains order', async () => {
      const {
        events
      } = await service('simple_search').search({}, { from: 0, size: 4 });

      let fourth = events[3].uid;

      const more = (await service('simple_search').search({}, { from: 3, size: 4 })).events;

      assert.deepEqual(more[0].uid, fourth);
    });

    describe('options', () => {
      it('parser option makes it possible to transform event on a search', async () => {
        const {
          events
        } = await service('simple_search').search({}, { size: 1 }, {
          parser: produce(e => {
            e.title = 'Bim!';
          })
        });
  
        assert.strictEqual(events[0].title, 'Bim!');
      });
    });
  });

  describe('additional fields', function() {
    let service;

    this.timeout(30000);

    const formSchema = {
      fields: [{
        schemaId: 12,
        field: 'organizer',
        fieldType: 'text'
      }, {
        schemaId: 12,
        field: 'organizeremail',
        fieldType: 'email'
      }, {
        schemaId: 12,
        field: 'totalnumberofvisitors',
        fieldType: 'integer'
      }, {
        schemaId: 12,
        field: 'authortestimony',
        fieldType: 'text'
      }]
    };

    before(async () => {
      service = Service(config);

      const r = await service.getConfig().client.indices.delete({
        index: 'test'
      });
    });

    before(async () => {
      const r = await service('simple_search').rebuild({
        eventsList: async (offset, limit) => {
          return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/02_customEvents.${offset}.${limit}.json`))
        },
        formSchema
      });
    });

    it('custom field is searched through custom key', async () => {
      const {
        total
      } = await service('simple_search').search({
        organizeremail: 'cannes@reedexpo.fr'
      }, {}, {
        formSchema
      });

      assert.equal(total, 1);
    });

    it('backward compatibility', async () => {
      const { total } = await service('simple_search').search({
        'custom.organizeremail' : 'cannes@reedexpo.fr'
      }, {}, {
        formSchema
      });

      assert.equal(total, 1);
    });

    it('extension data is not part of detailed result by default', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        'uid' : 15
      }, {}, { detailed: true });

      assert.equal(Object.keys(events[0]).includes('custom'), false);
    });


    it('additional data is part of result', async () => {
      const {
        events
      } = await service('simple_search').search({
        'organizeremail' : 'cannes@reedexpo.fr'
      }, {}, { detailed: true, formSchema });

      assert.equal(
        Object.keys(events[0]).includes('organizeremail'),
        true
      );
    });


    it('events from a specific agenda can be retrieved based on the agenda uid', async () => {
      const {
        events
      } = await service('simple_search').search({
        originAgendaUid : 21475128
      }, {}, { detailed: true });

      assert.equal(
        events[0].originAgenda.uid,
        21475128
      );
    });

    it('events matching a selection of origin agendas', async () => {
      const {
        events
      } = await service('simple_search').search({
        originAgendaUid : [21475128, 7678114]
      }, {}, { detailed: true });

      assert.deepEqual(
        _.uniq(events.map(e => e.originAgenda.uid)).sort(),
        [21475128, 7678114]
      );
    });

  });

});
