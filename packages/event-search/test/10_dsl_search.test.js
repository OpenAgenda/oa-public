'use strict';

const fs = require('fs');
const _ = require('lodash');

const config = require('../testconfig');
const postDSL = require('../utils/postDSL');
const Service = require('..');

describe('10 - event-search - unit: dsl search', () => {
  describe('simple search', () => {
    let service;
    let post;

    beforeAll(async () => {
      service = Service(config);

      try {
        await service.getConfig().client.indices.delete({
          index: 'test',
        });
      } catch (e) {
        // console.log(e);
      }

      post = postDSL.bind(null, _.pick(service.getConfig(), ['client']));

      await service('simple_search').rebuild({
        eventsList: async (lastId, limit) =>
          JSON.parse(fs.readFileSync(
            `${__dirname}/fixtures/10_events.${lastId}.${limit}.json`,
          )),

      });
    });

    it('an event can be retrieved by uid', async () => {
      const {
        events,
        total,
      } = await post('test', {
        query: {
          bool: {
            filter: [{
              term: {
                uid: 6,
              },
            }, {
              term: {
                _set: 'simple_search',
              },
            }],
          },
        },
      });

      expect(total).toBe(1);
      expect(events[0].slug).toBe('decouverte-du-handball-et-valorisation-du-mondial-de-handball');
    });

    it('several events can be retrieved by uid at once', async () => {
      const {
        events,
        total,
      } = await post('test', {
        query: {
          bool: {
            filter: [{
              terms: {
                uid: [6, 11],
              },
            }],
          },
        },
      });

      expect(total).toBe(2);

      expect(events.map(e => e.slug)).toEqual([
        'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
        'serres-la-claranda-cafe-citoyen',
      ]);
    });

    it('simple title search', async () => {
      const dsl = {
        query: {
          match: {
            _search_title: 'valorisation',
          },
        },
        _source: {
          excludes: ['_search_*'],
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events[0].slug).toBe('decouverte-du-handball-et-valorisation-du-mondial-de-handball');
    });

    it('simple english title search', async () => {
      const dsl = {
        query: {
          match: {
            _search_title: 'discovery',
          },
        },
        _source: {
          excludes: ['_search_*'],
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events[0].slug).toBe('decouverte-du-handball-et-valorisation-du-mondial-de-handball');
    });

    it('sorting can order by update timestamp', async () => {
      const dsl = {
        query: {
          match: {
            _search_title: 'Trié',
          },
        },
        sort: [{
          updatedAt: {
            order: 'desc',
          },
        }],
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(5);

      events.forEach((e, i) => {
        if (i === 0) {
          return;
        }
        expect(new Date(events[i - 1].updatedAt).getTime()).toBeGreaterThan(new Date(events[i].updatedAt).getTime());
      });
    });

    it(
      'sorting can show in order upcoming first and past second, then nearest from now first',
      async () => {
        const dsl = {
          query: {
            match: {
              _search_title: 'Trié',
            },
          },
          sort: [{
            'timings.end': {
              mode: 'min',
              order: 'asc',
              nested_path: 'timings',
              nested_filter: {
                range: { 'timings.end': { gte: 'now' } },
              },
            },
          }, {
            _search_last_timing: { order: 'desc' },
          }],
          _source: {
            excludes: ['_search_*'],
          },
        };

        const { events, total } = await post('test', dsl);

        expect(total).toBe(5);

        expect(events.map(e => e.slug)).toEqual([
          'nearest_in_the_future_0',
          'almost_furthest_in_the_future_1',
          'furthest_in_the_future_2',
          'nearest_past_event_3',
          'furthest_past_event_4',
        ]);
      },
    );

    it('match on title, description and keywords fields', async () => {
      const dsl = {
        query: {
          multi_match: {
            query: 'mississipi',
            fields: ['_search_title', '_search_description', '_search_keywords_text'],
          },
        },
      };

      const { events } = await post('test', dsl);

      expect(events.map(e => e.slug)).toEqual([
        'multi_1',
        'multi_2',
        'multi_3',
      ]);
    });

    it('filtering by state in agenda', async () => {
      const {
        events,
        total,
      } = await post('test', {
        query: {
          bool: {
            filter: [{
              term: {
                _set: 'simple_search',
              },
            }, {
              term: {
                state: 1,
              },
            }],
          },
        },
      });

      expect(events.length).toBe(1);
      expect(total).toBe(1);
    });

    it(
      'filtering by timing to show only events starting within a certain time bracket ( independant of date )',
      async () => {
        const dsl = {
          query: {
            bool: {
              must: [{
                match: {
                  _search_title: 'Horaires',
                },
              }],
              // doc: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
              filter: [{
                nested: {
                  path: 'timings',
                  score_mode: 'min',
                  query: {
                    range: {
                      'timings._search_begin_from_midnight': {
                        gte: 13 * 60 * 60,
                        lte: 17 * 60 * 60,
                      },
                    },
                  },
                },
              }],
            },
          },
          _source: {
            // excludes does not go deep.
            excludes: ['_search_*', 'timings._search_*'],
          },
        };

        const { events, total } = await post('test', dsl);

        expect(total).toBe(1);

        expect(events.map(e => e.slug)).toEqual(['one_timing_fits_within bracket']);
      },
    );

    it('date range is displayed in local time', async () => {
      const dsl = {
        query: {
          match: {
            _search_title: 'OtherTimezoneHoraires',
          },
        },
      };

      const { events } = await post('test', dsl);

      expect(events[0].dateRange).toEqual({
        ar: 'الإثنين ٢٤ أكتوبر ٢٠١٦, 08:00',
        de: 'Montag 24 Oktober 2016, 08:00',
        fr: 'Lundi 24 octobre 2016, 08h00',
        en: 'Monday 24 October 2016, 08:00',
        es: 'Lunes 24 octubre 2016, 08:00',
        it: 'Lunedì 24 ottobre 2016, 08:00',
      });
    });

    it('filtering by timing for a different timezone', async () => {
      // new york event happens at 2016-10-24T12:00:00.000Z
      // so thats -4 hours, should be 8 in the morning

      const dsl = {
        query: {
          bool: {
            must: [{
              match: {
                _search_title: 'OtherTimezoneHoraires',
              },
            }],
            // doc: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
            filter: [{
              nested: {
                path: 'timings',
                score_mode: 'min',
                query: {
                  range: {
                    'timings._search_begin_from_midnight': {
                      gte: 8 * 60 * 60,
                      lte: 8 * 60 * 60,
                    },
                  },
                },
              },
            }],
          },
        },
        _source: {
          // excludes does not go deep.
          excludes: ['_search_*', 'timings._search_*'],
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events.map(e => e.slug)).toEqual(['new_york_event']);
    });

    it(
      'filtering by region ( same for location.department, city, countryCode )',
      async () => {
        const dsl = {
          query: {
            term: {
              'location.region': 'Auvergne-Rhône-Alpes',
            },
          },
        };

        const { events, total } = await post('test', dsl);

        expect(total).toBe(1);

        expect(events.map(e => e.slug)).toEqual(['rhone_region_event']);
      },
    );

    it('filtering by geolocation', async () => {
      const dsl = {
        query: {
          geo_bounding_box: {
            _search_location: {
              top_left: {
                lat: 50,
                lon: 5,
              },
              bottom_right: {
                lat: 49,
                lon: 5.5,
              },
            },
          },
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events.map(e => e.slug)).toEqual(['verdun_bound_box']);
    });

    it('filtering by language', async () => {
      const dsl = {
        query: {
          term: {
            _search_languages: 'de',
          },
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events.map(e => e.slug)).toEqual(['german_event']);
    });

    it('filtering by keyword', async () => {
      const dsl = {
        query: {
          term: {
            _search_keywords: 'word',
          },
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events.map(e => e.slug)).toEqual(['keyword_event']);
    });

    it('filtering by multiple keywords', async () => {
      const dsl = {
        query: {
          bool: {
            must: [{
              term: {
                _search_keywords: 'autre',
              },
            }, {
              term: {
                _search_keywords: 'clé',
              },
            }],
          },
        },
      };

      const { events, total } = await post('test', dsl);

      expect(total).toBe(1);

      expect(events.map(e => e.slug)).toEqual(['keyword_event_2']);
    });

    it('filtering to keep events in between a timestamp bracket', async () => {
      const dsl = {
        query: {
          bool: {
            // doc: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
            filter: [{
              nested: {
                path: 'timings',
                score_mode: 'min',
                query: {
                  range: {
                    'timings.begin': {
                      gte: new Date('2013-02-01'),
                      lte: new Date('2013-02-28'),
                    },
                  },
                },
              },
            }],
          },
        },
      };

      const { events } = await post('test', dsl);

      expect(events.map(e => e.slug)).toEqual(['bracketed_timestamp_1', 'bracketed_timestamp_2', 'bracketed_timestamp_3']);
    });

    it('trasverse using scroll', async () => {
      const dsl = {
        query: {
          match_all: {},
        },
      };

      let fetchedCount = 0;

      const cacheFor = '1m';

      const { events, scrollId } = await post('test', dsl, { scroll: cacheFor });

      fetchedCount += events.length;

      const nextEvents = (await service('simple_search').search.scroll(scrollId, cacheFor)).events;

      fetchedCount += nextEvents.length;

      const result = await service('simple_search').search.scroll(scrollId, cacheFor);

      fetchedCount += result.events.length;

      expect(fetchedCount).toBe(result.total);
    });

    it('from/size navigation works fine', async () => {
      const dsl = {
        from: 0,
        size: 5,
        query: {
          match_all: {},
        },
        sort: [{
          'timings.end': {
            mode: 'min',
            order: 'asc',
            nested_path: 'timings',
            nested_filter: {
              range: { 'timings.end': { gte: 'now' } },
            },
          },
        }, {
          _search_last_timing: { order: 'desc' },
        }],
      };

      let { events } = await post('test', dsl);

      const fourth = events[3].uid;

      dsl.from = 3;

      events = (await post('test', dsl)).events;

      expect(events[0].uid).toBe(fourth);
    });
  });
});
