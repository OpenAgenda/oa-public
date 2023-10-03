'use strict';

const fs = require('node:fs');
const _ = require('lodash');

const config = require('../testconfig');

const Service = require('..');
const postDSL = require('../utils/postDSL');

describe('16 - event search - functional: more like this', () => {
  let service;
  let dslSearch;

  beforeAll(async () => {
    service = Service(config);
  });

  beforeAll(async () => {
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
      eventsList: async (lastId, limit) => JSON.parse(fs.readFileSync(
        `${__dirname}/fixtures/16_events.${lastId}.${limit}.json`,
      )),
    });
  });

  beforeAll(async () => {
    dslSearch = postDSL.bind(null, _.pick(service.getConfig(), ['client']));
  });

  describe('dsl more like this', () => {
    it('a more like this taken from keywords', async () => {
      /**
       * as seen in 15_ tests, array of values matches only
       * for generic like search.
       */

      const { events } = await dslSearch('test', {
        query: {
          bool: {
            must: [{
              more_like_this: {
                fields: ['_search_keywords'],
                min_term_freq: 1,
                min_doc_freq: 1,
                like: ['vin chaud'],
              },
            }],
            filter: [{
              term: {
                _set: 'simple_search',
              },
            }],
          },
        },
      });

      expect(events.map(e => e.uid).sort()).toEqual([57, 82]);
    });
  });

  describe('service more like this', () => {
    it('mlt on one keyword', async () => {
      const { events, total } = await service('simple_search').moreLikeThis({
        keywords: {
          fr: ['vin chaud'],
        },
      });

      expect(total).toBe(2);

      expect(events.map(e => e.uid).sort()).toEqual([57, 82]);
    });

    it('mlt on two keywords', async () => {
      const { total, events } = await service('simple_search').moreLikeThis({
        keywords: {
          fr: ['vin chaud', 'bières'],
        },
      });

      // still matches event with "vin chaud" keyword only
      expect(total).toBe(2);

      // but event with all keywords comes in first
      expect(events[0].uid).toBe(82);
    });

    it('mlt on title', async () => {
      const { total, events } = await service('simple_search').moreLikeThis({
        title: {
          fr: 'Bazar',
        },
      });

      expect(total).toBe(1);

      expect(events[0].uid).toBe(107);
    });

    it('mlt on title and keywords', async () => {
      const { events } = await service('simple_search').moreLikeThis({
        title: {
          fr: 'Les doigts de la main',
        },
        keywords: {
          fr: ['doigts'],
        },
      });

      expect(events.map(e => e.uid)).toEqual([132, 157]);
    });

    it('mlt on title and keywords with boosts', async () => {
      const mltRequest = {
        title: {
          fr: 'Les doigts de la main',
        },
        keywords: {
          fr: ['doigts'],
        },
      };

      expect((await service('simple_search').moreLikeThis(mltRequest, {
        boost: { title: 20, keywords: 50 },
      })).events.map(e => e.uid).sort()).toEqual([132, 157]);

      expect((await service('simple_search').moreLikeThis(mltRequest, {
        boost: { title: 50, keywords: 30 },
      })).events.map(e => e.uid).sort()).toEqual([132, 157]);
    });

    it('mlt on nothing should return empty result', async () => {
      const { total, events } = await service('simple_search').moreLikeThis({});

      expect(total).toBe(0);

      expect(events.length).toBe(0);
    });

    it('mlt on department with title in different department', async () => {
      const { events } = await service('simple_search').moreLikeThis({
        keywords: {
          fr: ['janine'], // like shop_event_2
        },
        location: {
          department: 'Finistère', // like finger_event_2
        },
      }, {
        boost: {
          keywords: 10,
          'location.department': 20,
        },
      });

      expect(events.map(e => e.slug)).toEqual([
        'finger_event_2',
        'shop_event_2',
      ]);
    });

    it(
      'mlt on department with title in different department with different boost',
      async () => {
        const { events } = await service('simple_search').moreLikeThis({
          keywords: {
            fr: ['janine'],
          },
          location: {
            department: 'Finistère',
          },
        }, { boost: { keywords: 20, 'location.department': 10 } });

        expect(events.map(e => e.slug)).toEqual(['shop_event_2', 'finger_event_2']);
      },
    );
  });
});
