'use strict';

const fs = require('fs');
const _ = require('lodash');
const {
  produce,
} = require('immer');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: search', () => {
  describe('simple use cases', () => {
    let service;

    beforeAll(async () => {
      service = Service(config);

      try {
        await service.getConfig().client.indices.delete({
          index: 'test',
        });
      } catch (e) {
        // console.log(e);
      }
    });

    beforeAll(async () => {
      await service('simple_search').rebuild({
        eventsList: async (lastId, limit) => JSON.parse(
          fs.readFileSync(`${__dirname}/fixtures/02_events.${lastId}.${limit}.json`),
        ),
      });
    });

    describe('filtering', () => {
      it('an event can be retrieved by uid', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({ uid: 6 });

        expect(total).toBe(1);

        expect(events[0].slug).toBe(
          'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
        );
      });

      it('several events can be retrieved by uid at once', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({ uid: [6, 11] });

        expect(total).toBe(2);

        expect(events.map(e => e.slug)).toEqual([
          'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
          'serres-la-claranda-cafe-citoyen',
        ]);
      });

      it('an event can be retrieved with its slug', async () => {
        const {
          events,
        } = await service('simple_search').search({
          slug: 'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
        });

        expect(events[0].uid).toBe(6);
      });

      it('several events can be retrieved by slug at once', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({
          slug: [
            'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
            'serres-la-claranda-cafe-citoyen',
          ],
        });

        expect(total).toBe(2);
        expect(events.map(e => e.uid)).toEqual([6, 11]);
      });

      it('country code search', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({ countryCode: 'CH' });

        expect(total).toBe(1);
        expect(events.map(e => e.slug)).toEqual(['evenement_suisse']);
      });

      it('keyword search', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({ keyword: 'word' });

        expect(total).toBe(1);
        expect(
          events.map(e => e.slug),
        ).toEqual([
          'keyword_event',
        ]);
      });

      it('keywords search', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({ keyword: ['autre', 'clé'] });

        expect(total).toBe(1);
        expect(
          events.map(e => e.slug),
        ).toEqual(['keyword_event_2']);
      });

      it('lang search', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({ lang: 'de' });

        expect(total).toBe(1);
        expect(events.map(e => e.slug)).toEqual(['german_event']);
      });

      it('region search', async () => {
        const {
          events,
        } = await service('simple_search').search({
          region: 'Ile-de-France',
        }, { size: 100 }, { detailed: true });

        const regions = _.uniq(events.map(e => e.location.region));

        expect(regions.length).toBe(1);

        expect(regions[0]).toBe('Ile-de-France');
      });

      it('regions search', async () => {
        const {
          events,
        } = await service('simple_search').search({
          region: ['Ile-de-France', 'New York'],
        }, { size: 100 }, { detailed: true });

        const regions = _.uniq(events.map(e => e.location.region));

        expect(regions).toEqual(['Ile-de-France', 'New York']);
      });
    });

    describe('result', () => {
      it(
        'by default, only fields defined in service/config base fields are returned',
        async () => {
          const {
            events,
          } = await service('simple_search').search({
            uid: 6,
          });

          const postParseFields = ['contributor', 'lastTiming', 'nextTiming'];

          const expectedFields = service.getConfig().baseSearchIncludes.concat(postParseFields).map(f => f.split('.')[0]);

          expect(
            Object.keys(events[0])
              .filter(field => !expectedFields.includes(field)),
          ).toEqual([]);
        },
      );

      it('by default, event timings are converted to local timezone', async () => {
        const {
          events,
        } = await service('simple_search').search({
          uid: 6,
        }, null, {
          detailed: true,
        });

        expect(events[0].timings[0].begin).toBe(
          '2016-10-24T14:00:00+02:00',
        );
      });

      it(
        'by default, undetailed search returns location name, address, latitude and longitude',
        async () => {
          const {
            events,
          } = await service('simple_search').search({
            uid: 6,
          });

          expect(Object.keys(events[0].location).sort()).toEqual(
            ['address', 'latitude', 'longitude', 'name'],
          );
        },
      );

      it(
        'if monolingual option is set, multilingal fields are flattened to specified language',
        async () => {
          const {
            events,
          } = await service('simple_search').search({ uid: 6 }, null, {
            monolingual: 'fr',
            detailed: true,
          });

          [
            'title',
            'description',
            'dateRange',
            'country',
            'longDescription',
          ].map(f => events[0][f]).forEach(data => {
            expect(typeof data).toBe('string');
          });
        },
      );

      it('all fields are returned when detailed option is true', async () => {
        const {
          events,
        } = await service('simple_search').search({ uid: 6 }, null, {
          detailed: true,
        });

        expect(Object.keys(events[0])).toEqual(
          [
            'longDescription', 'country',
            'private',
            'featured', 'keywords',
            'accessibility', 'dateRange',
            'timezone', 'originAgenda',
            'description', 'title',
            'onlineAccessLink', 'uid',
            'createdAt', 'draft',
            'timings', 'member',
            'state', 'slug',
            'updatedAt', 'image',
            'attendanceMode', 'creatorUid',
            'registration', 'location', 'ownerUid',
            'age', 'lastTiming',
            'nextTiming',
          ],
        );
      });
    });

    describe('search searches', () => {
      it('open search one or more words', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({
          search: 'Mississipi',
        });

        expect(total).toBe(3);
        expect(events.map(e => e.slug)).toEqual(
          ['multi_1', 'multi_2', 'multi_3'],
        );
      });

      it('search on word with apostrophe', async () => {
        const {
          total,
        } = await service('simple_search').search({
          search: 'Horreur',
        });

        expect(total).toBe(1);
      });

      it('search on word with plural', async () => {
        const {
          total,
        } = await service('simple_search').search({
          search: 'Horreurs',
        });

        expect(total).toBe(1);
      });

      it('open search on a city name', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({
          search: 'Quimper',
        });

        expect(total).toBe(1);
        expect(
          events.map(e => e.slug),
        ).toEqual(
          ['quimper_event'],
        );
      });

      it('open search on a location name', async () => {
        const {
          total,
          events,
        } = await service('simple_search').search({
          search: 'Cathédrale',
        });

        expect(total).toBe(1);
        expect(events[0].slug).toBe('quimper_event');
      });

      it('open search on country name in french', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({
          search: 'Suisse',
        });

        expect(total).toBe(1);
        expect(
          events.map(e => e.slug),
        ).toEqual(
          ['evenement_suisse'],
        );
      });

      it('open search on country name in english', async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({
          search: 'Switzerland',
        });

        expect(total).toBe(1);
        expect(events.map(e => e.slug)).toEqual(
          ['evenement_suisse'],
        );
      });
    });

    describe('attendanceMode', () => {
      it('attendanceMode value is 1 (offline) by default', async () => {
        const {
          events,
        } = await service('simple_search').search();

        expect(events[0].attendanceMode).toBe(1);
      });

      it('events can by filtered by attendanceMode', async () => {
        const {
          events,
        } = await service('simple_search').search({
          attendanceMode: [2, 3],
        });

        expect(events[0].attendanceMode).toBe(2);
      });

      it('onlineAccessLink is present for attendanceMode of 2 and 3', async () => {
        const {
          events,
        } = await service('simple_search').search({
          attendanceMode: [2, 3],
        });

        expect(events[0].onlineAccessLink).toBe('https://webin.ar');
      });
    });

    describe('local time', () => {
      it('not filtered', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'local_time',
        };

        const { total } = await service('simple_search').search(query);

        expect(total).toBe(2);
      });

      it('before 11am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            lte: 11 * 60 * 60,
          },
        };

        const { total } = await service('simple_search').search(query);

        expect(total).toBe(0);
      });

      it('after 11am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11 * 60 * 60,
          },
        };

        const { total } = await service('simple_search').search(query);

        expect(total).toBe(2);
      });

      it('after 11am, before 12am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 11 * 60 * 60,
            lte: 12 * 60 * 60,
          },
        };

        const {
          total,
          events,
        } = await service('simple_search').search(query);

        expect(total).toBe(1);
        expect(events[0].slug).toBe('local_time_1');
      });

      it('after 12am', async () => {
        const query = {
          keyword: 'local_time',
          localTime: {
            gte: 12 * 60 * 60,
          },
        };

        const {
          total,
          events,
        } = await service('simple_search').search(query);

        expect(total).toBe(1);
        expect(events[0].slug).toBe('local_time_2');
      });
    });

    describe('date', () => {
      it('not filtered', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
        };

        const { total } = await service('simple_search').search(query);

        expect(total).toBe(2);
      });

      it('after 2000', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          timings: {
            gte: '2000-01-01T00:00:00.000Z',
          },
        };

        const { total, events } = await service('simple_search').search(query);

        expect(total).toBe(1);
        expect(events[0].slug).toBe('date_2');
      });

      it('before 2000', async () => {
        const query = {
          // subset of fixtures for local time tests
          keyword: 'date_event',
          timings: {
            lte: '2000-01-01T00:00:00.000Z',
          },
        };

        const { total, events } = await service('simple_search').search(query);

        expect(total).toBe(1);
        expect(events[0].slug).toBe('date_1');
      });

      it('relative search: greater than today', async () => {
        const { total } = await service('simple_search').search({
          search: 'Trié',
          date: {
            gte: 'today',
            timezone: 'Europe/Paris',
          },
        });

        expect(total).toBe(3);
      });
    });

    describe('aggregation', () => {
      it('keyword search, with aggregation', async () => {
        const {
          aggregations,
        } = await service('simple_search').search({
          keyword: 'word',
        }, { size: 0 }, {
          aggregations: ['keywords', 'timings'],
        });

        expect(aggregations).toEqual({
          keywords: [
            { key: 'clé', eventCount: 1 },
            { key: 'key', eventCount: 1 },
            { key: 'mot', eventCount: 1 },
            { key: 'word', eventCount: 1 },
          ],
          timings: [{
            key: '2010-04-01', timingCount: 2,
          }],
        });
      });

      it('timing aggregation: search is bounded by current month', async () => {
        const { aggregations, total } = await service('simple_search').search({
          keyword: 'word',
        }, { size: 0 }, {
          aggregations: 'eventsByDateRanges',
        });

        expect(total).toBe(1);

        // one day for each. Depends of the month
        expect(aggregations.eventsByDateRanges.length).toBeGreaterThanOrEqual(28);
        expect(aggregations.eventsByDateRanges.length).toBeLessThanOrEqual(31);
        expect(aggregations.eventsByDateRanges.filter(h => h.eventCount !== 0).length).toBe(0);
      });

      it('timing aggregation: keyword search with results', async () => {
        const {
          aggregations,
        } = await service('simple_search').search({
          date: {
            gte: new Date('2010-04-01'),
            lte: new Date('2010-04-30'),
          },
          keyword: 'word',
        }, { size: 0 }, {
          aggregations: 'eventsByDateRanges',
        });

        expect(aggregations.eventsByDateRanges.length).toBe(30);
        expect(aggregations.eventsByDateRanges[0].eventCount).toBe(1);
        expect(aggregations.eventsByDateRanges[0].sampleEvents[0].uid).toBe(14);
      });

      it('unknown requested aggregation throws not found error', async () => {
        let error;
        try {
          await service('simple_search').search({}, { size: 0 }, { aggregations: 'unknownagg' });
        } catch (e) {
          error = e;
        }
        expect(error.name).toBe('BadRequest');
        expect(error.code).toBe(400);
      });
    });

    describe('stream', () => {
      it(
        'simple streamed search returns all the events matching the search',
        async () => {
          const { total } = await service('simple_search').search();

          const stream = service('simple_search').search.stream();

          let count = 0;

          stream.on('data', _event => {
            count += 1;
          });

          return new Promise(rs => {
            stream.on('end', () => {
              expect(count).toBe(total);
              rs();
            });
          });
        },
      );

      it(
        'buffer loads from elasticsearch can be tracked with "reloading" event',
        async () => {
          const stream = service('simple_search').search.stream();

          stream.on('data', _event => {});

          stream.on('reloading', data => {
            expect(
              Object.keys(data),
            ).toEqual(
              ['cursor', 'total'],
            );
          });

          return new Promise(rs => stream.on('end', rs));
        },
      );

      it('size of buffer reload chunks can be set in options', async () => {
        const stream = service('simple_search').search.stream({}, { size: 1 });

        stream.on('data', _event => {});

        let total; let
          count = 0;

        stream.on('reloading', data => {
          total = data.total;

          count += 1;
        });

        return new Promise(rs => {
          stream.on('end', () => {
            expect(total).toBe(count + 1);
            rs();
          });
        });
      });
    });

    it('geolocation filtering', async () => {
      const {
        events,
        total,
      } = await service('simple_search').search({
        geo: {
          northEast: {
            lat: 50,
            lng: 5.5,
          },
          southWest: {
            lat: 49,
            lng: 5,
          },
        },
      });

      expect(total).toBe(1);
      expect(
        events.map(e => e.slug),
      ).toEqual(
        ['verdun_bound_box'],
      );
    });

    it(
      'sorting can show in order upcoming first and past second, then nearest from now first',
      async () => {
        const {
          events,
          total,
        } = await service('simple_search').search({
          search: 'Trié',
          sort: 'timings.asc',
        });

        expect(total).toBe(5);
        expect(
          events.map(e => e.slug),
        ).toEqual(
          [
            'nearest_in_the_future_0',
            'almost_furthest_in_the_future_1',
            'furthest_in_the_future_2',
            'nearest_past_event_3',
            'furthest_past_event_4',
          ],
        );
      },
    );

    it('sorting works in updatedAt asc order', async () => {
      const { events } = await service('simple_search').search({
        search: 'Trié',
        sort: 'updatedAt.asc',
      }, {}, { detailed: true });

      events.forEach((e, i) => {
        if (i === 0) return;
        expect(e.updatedAt >= events[i - 1].updatedAt).toBeTruthy();
      });
    });

    it('sorting works in updatedAt desc order', async () => {
      const {
        events,
      } = await service('simple_search').search({
        search: 'Trié',
        sort: 'updatedAt.desc',
      }, {}, {
        detailed: true,
      });

      events.forEach((e, i) => {
        if (i === 0) return;

        expect(e.updatedAt < events[i - 1].updatedAt).toBeTruthy();
      });
    });

    it('sorting works as an array as well: descending on city name', async () => {
      const {
        events,
      } = await service('simple_search').search({
        keyword: 'lieu',
        sort: [
          'location.city.desc',
        ],
      }, {}, { detailed: true });

      expect(
        events.map(e => _.pick(e, ['location.city']).location?.city),
      ).toEqual(
        [
          'Quimper',
          'New York',
          'Grandson',
          undefined, // online event
        ],
      );
    });

    it('sorting works as an array as well: ascending on city name', async () => {
      const {
        events,
      } = await service('simple_search').search({
        keyword: 'lieu',
        sort: [
          'location.city.asc',
        ],
      }, {}, { detailed: true });

      expect(
        events.map(e => _.pick(e, ['location.city']).location?.city),
      ).toEqual(
        [
          'Grandson',
          'New York',
          'Quimper',
          undefined, // online event
        ],
      );
    });

    it('navigate using from & size returns expected number of events', async () => {
      const {
        events,
      } = await service('simple_search').search({}, { from: 0, size: 4 });

      expect(events.length).toBe(4);
    });

    it('navigate using from & size maintains order', async () => {
      const {
        events,
      } = await service('simple_search').search({}, { from: 0, size: 4 });

      const fourth = events[3].uid;

      const more = (await service('simple_search').search({}, { from: 3, size: 4 })).events;

      expect(more[0].uid).toEqual(fourth);
    });

    describe('options', () => {
      it(
        'parser option makes it possible to transform event on a search',
        async () => {
          const {
            events,
          } = await service('simple_search').search({}, { size: 1 }, {
            parser: produce(e => {
              e.title = 'Bim!';
            }),
          });

          expect(events[0].title).toBe('Bim!');
        },
      );
    });
  });

  describe('additional fields', () => {
    let service;

    const formSchema = {
      fields: [{
        schemaId: 12,
        field: 'organizer',
        fieldType: 'text',
      }, {
        schemaId: 12,
        field: 'organizeremail',
        fieldType: 'email',
      }, {
        schemaId: 12,
        field: 'totalnumberofvisitors',
        fieldType: 'integer',
      }, {
        schemaId: 12,
        field: 'authortestimony',
        fieldType: 'text',
      }],
    };

    beforeAll(async () => {
      service = Service(config);

      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    });

    beforeAll(async () => {
      await service('simple_search').rebuild({
        eventsList: async (offset, limit) => JSON.parse(fs.readFileSync(`${__dirname}/fixtures/02_customEvents.${offset}.${limit}.json`)),
        formSchema,
      });
    });

    it('custom field is searched through custom key', async () => {
      const {
        total,
      } = await service('simple_search').search({
        organizeremail: 'cannes@reedexpo.fr',
      }, {}, {
        formSchema,
      });

      expect(total).toBe(1);
    });

    it('backward compatibility', async () => {
      const { total } = await service('simple_search').search({
        'custom.organizeremail': 'cannes@reedexpo.fr',
      }, {}, {
        formSchema,
      });

      expect(total).toBe(1);
    });

    it('extension data is not part of detailed result by default', async () => {
      const {
        events,
      } = await service('simple_search').search({
        uid: 15,
      }, {}, { detailed: true });

      expect(Object.keys(events[0]).includes('custom')).toBe(false);
    });

    it('additional data is part of result', async () => {
      const {
        events,
      } = await service('simple_search').search({
        organizeremail: 'cannes@reedexpo.fr',
      }, {}, { detailed: true, formSchema });

      expect(
        Object.keys(events[0]).includes('organizeremail'),
      ).toBe(
        true,
      );
    });

    it(
      'events from a specific agenda can be retrieved based on the agenda uid',
      async () => {
        const {
          events,
        } = await service('simple_search').search({
          originAgendaUid: 21475128,
        }, {}, { detailed: true });

        expect(
          events[0].originAgenda.uid,
        ).toBe(
          21475128,
        );
      },
    );

    it('events matching a selection of origin agendas', async () => {
      const {
        events,
      } = await service('simple_search').search({
        originAgendaUid: [21475128, 7678114],
      }, {}, { detailed: true });

      expect(
        _.uniq(events.map(e => e.originAgenda.uid)).sort(),
      ).toEqual(
        [21475128, 7678114],
      );
    });
  });
});
