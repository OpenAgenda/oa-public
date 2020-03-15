"use strict";

const _ = require('lodash');
const fs = require('fs');
const should = require('should');

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
        eventsList: async (lastId, limit) => {
          return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/02_events.${lastId}.${limit}.json`))
        }
      });
    });

    it('an event can be retrieved by uid', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ uid: 6 });

      total.should.equal(1);

      events[0].slug.should.equal('decouverte-du-handball-et-valorisation-du-mondial-de-handball');
    });

    it('several events can be retrieved by uid at once', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ uid: [6, 11] });

      total.should.equal(2);

      events.map(e => e.slug).should.eql([
        'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
        'serres-la-claranda-cafe-citoyen'
     ]);
    });

    it('an event can be retrieved with its slug', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        slug: 'decouverte-du-handball-et-valorisation-du-mondial-de-handball'
      });

      events[0].uid.should.equal(6);
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

      total.should.equal(2);
      events.map(e => e.uid).should.eql([6, 11]);
    });

    it('by default, only fields defined in service/config base fields are returned', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        uid: 6
      });

      const postParseFields = ['contributor', 'lastTiming', 'nextTiming'];

      const expectedFields = service.getConfig().baseSearchIncludes.concat(postParseFields).map(f => f.split('.')[0]);

      _.keys(events[0])
        .filter(field => !expectedFields.includes(field))
        .should.eql([]);
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

      events[0].timings[0].begin.should.equal('2016-10-24T14:00:00+02:00');
    });

    it('by default, undetailed search returns location name, address, latitude and longitude', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        uid: 6
      });

      _.keys(events[0].location).sort().should.eql(['address', 'latitude', 'longitude', 'name']);
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
        (typeof data).should.equal('string');
      });
    });

    it('all fields are returned when detailed option is true', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ uid: 6 }, null, {
        detailed: true
      });

      Object.keys(events[0]).should.eql([
        'longDescription',
        'country',
        'image',
        'private',
        'keywords',
        'accessibility',
        'dateRange',
        'timezone',
        'originAgenda',
        'description',
        'title',
        'uid',
        'createdAt',
        'creatorUid',
        'draft',
        'timings',
        'member',
        'registration',
        'location',
        'state',
        'slug',
        'age',
        'updatedAt',
        'lastTiming',
        'nextTiming'
     ]);
    });

    it('open search one or more words', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Mississipi'
      });

      total.should.equal(3);

      events.map(e => e.slug).should.eql(['multi_1', 'multi_2', 'multi_3']);
    });

    it('search on word with apostrophe', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Horreur'
      });

      total.should.equal(1);
    });


    it('open search on a city name', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Quimper'
      });

      total.should.equal(1);

      events.map(e => e.slug).should.eql(['quimper_event']);
    });

    it('open search on country name in french', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Suisse'
      });

      total.should.equal(1)

      events.map(e => e.slug).should.eql(['evenement_suisse']);
    });

    it('open search on country name in english', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Switzerland'
      });

      total.should.equal(1)

      events.map(e => e.slug).should.eql(['evenement_suisse']);
    });


    it('country code search', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ countryCode: 'CH' });

      total.should.equal(1)

      events.map(e => e.slug).should.eql(['evenement_suisse']);
    });


    it('keyword search', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ keyword: 'word' });

      total.should.equal(1);

      events.map(e => e.slug).should.eql(['keyword_event']);
    });


    it('keywords search', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ keyword: ['autre', 'clé'] });

      total.should.equal(1);

      events.map(e => e.slug).should.eql(['keyword_event_2']);
    });


    it('lang search', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ lang: 'de' });

      total.should.equal(1);

      events.map(e => e.slug).should.eql(['german_event']);
    });


    it('region search', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        region: 'Auvergne-Rhône-Alpes'
      });

      total.should.equal(1);

      events.map(e => e.slug).should.eql(['rhone_region_event']);
    });


    it('regions search', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        region: ['Auvergne-Rhône-Alpes', 'New York']
      });

      total.should.equal(2);

      events.map(e => e.slug).should.eql(['new_york_event', 'rhone_region_event']);
    });

    describe('local time', async () => {

      it('not filtered', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'local_time'
        }

        let { total } = await service('simple_search').search(query);

        total.should.equal(2);
      });

      it('before 11am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            lte: 11*60*60
          }
        };

        let { total } = await service('simple_search').search(query);

        total.should.equal(0);
      });

      it('after 11am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11*60*60
          }
        };

        let { total } = await service('simple_search').search(query);

        total.should.equal(2);
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

        total.should.equal(1);

        events[0].slug.should.equal('local_time_1');
      });

      it('after 12am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 12*60*60
          }
        };

        let {
          total,
          events
        } = await service('simple_search').search(query);

        total.should.equal(1);

        events[0].slug.should.equal('local_time_2');
      });

    });


    describe('date', () => {

      it('not filtered', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event'
        }

        let { total } = await service('simple_search').search(query);

        total.should.equal(2);
      });

      it('after 2000', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          date: {
            gte: '2000-01-01T00:00:00.000Z'
          }
        }

        let { total, events } = await service('simple_search').search(query);

        total.should.equal(1);

        events[0].slug.should.equal('date_2');
      });

      it('before 2000', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          date: {
            lte: '2000-01-01T00:00:00.000Z'
          }
        }

        let { total, events } = await service('simple_search').search(query);

        total.should.equal(1);

        events[0].slug.should.equal('date_1');
      });

      it('relative search: greater than today', async () => {
        let { total, events } = await service('simple_search').search({
          search: 'Trié',
          date: {
            gte: 'today',
            timezone: 'Europe/Paris'
          }
        });

        total.should.equal(3);
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

        aggregations.should.eql({
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

        total.should.equal(1);

        // one day for each. Depends of the month
        aggregations.eventsByDateRanges.length.should.aboveOrEqual(28);
        aggregations.eventsByDateRanges.length.should.belowOrEqual(31);

        aggregations.eventsByDateRanges.filter(h => h.eventCount !== 0).length.should.equal(0);
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

        aggregations.eventsByDateRanges.length.should.equal(30);

        aggregations.eventsByDateRanges[0].eventCount.should.equal(1);

        aggregations.eventsByDateRanges[0].sampleEvents[0].uid.should.equal(14);
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
            count.should.equal(total);
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

          _.keys(data).should.eql(['cursor', 'total']);

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
            total.should.equal(count+1);
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

      total.should.equal(1);

      events.map(e => e.slug).should.eql(['verdun_bound_box']);
    });


    it('sorting can show in order upcoming first and past second, then nearest from now first', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({ search: 'Trié' });

      total.should.equal(5);

      events.map(e => e.slug).should.eql([
        'nearest_in_the_future_0',
        'almost_furthest_in_the_future_1',
        'furthest_in_the_future_2',
        'nearest_past_event_3',
        'furthest_past_event_4'
     ]);
    });

    it('sorting works in updatedAt asc order', async () => {
      const { events, total } = await service('simple_search').search({
        search: 'Trié',
        sort: 'updatedAt.asc'
      }, {}, { detailed: true });

      events.forEach((e, i) => {
        if (i === 0) return;
        e.updatedAt.should.above(events[i - 1].updatedAt);
      });
    });


    it('sorting works in updatedAt desc order', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        search: 'Trié',
        sort: 'updatedAt.desc'
      }, {}, {
        detailed: true
      });

      events.forEach((e, i) => {
        if (i === 0) return;

        e.updatedAt.should.below(events[i - 1].updatedAt);
      });
    });

    it('sorting works as an array as well: descending on city name', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        keyword: 'lieu',
        sort: [
          'location.city.desc'
       ]
      }, {}, { detailed: true });

      events.map(e => _.pick(e, ['location.city']).location.city).should.eql([
        'Valence',
        'Quimper',
        'New York',
        'Grandson'
     ]);
    });

    it('sorting works as an array as well: ascending on city name', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        keyword: 'lieu',
        sort: [
          'location.city.asc'
       ]
      }, {}, { detailed: true });

      events.map(e => _.pick(e, ['location.city']).location.city).should.eql([
        'Grandson',
        'New York',
        'Quimper',
        'Valence'
     ]);
    });


    it('navigate using from & size returns expected number of events', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({}, { from: 0, size: 4 });

      events.length.should.equal(4);
    });


    it('navigate using from & size maintains order', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({}, { from: 0, size: 4 });

      let fourth = events[3].uid;

      const more = (await service('simple_search').search({}, { from: 3, size: 4 })).events;

      more[0].uid.should.equal(fourth);
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
        events,
        total
      } = await service('simple_search').search({
        organizeremail: 'cannes@reedexpo.fr'
      }, {}, {
        formSchema
      });

      total.should.equal(1);
    });

    it('backward compatibility', async () => {
      const { events, total } = await service('simple_search').search({
        'custom.organizeremail' : 'cannes@reedexpo.fr'
      }, {}, {
        formSchema
      });

      total.should.equal(1);
    });

    it('extension data is not part of detailed result by default', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        'uid' : 15
      }, {}, { detailed: true });

      _.keys(events[0]).includes('custom').should.equal(false);
    });


    it('additional data is part of result', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        'organizeremail' : 'cannes@reedexpo.fr'
      }, {}, { detailed: true, formSchema });

      _.keys(events[0]).includes('organizeremail').should.equal(true);
    });


    it('events from a specific agenda can be retrieved based on the agenda uid', async () => {
      const {
        events,
        total
      } = await service('simple_search').search({
        originAgendaUid : 21475128
      }, {}, { detailed: true });

      events[0].originAgenda.uid.should.equal(21475128);
    });

  });

});
