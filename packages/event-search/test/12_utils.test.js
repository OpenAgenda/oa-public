'use strict';

const moment = require('moment');

const appendFirstNextAndLastTiming = require('../utils/appendFirstNextAndLastTiming');
const convertToLocalTimezone = require('../utils/convertToLocalTimezone');
const derelativize = require('../utils/derelativize');
const geoJSON = require('../utils/geoJSON');
const getDSLSortPart = require('../utils/getDSLSortPart');
const validateNav = require('../utils/validateNav');
const validateQuery = require('../utils/validateQuery');
const preCleanRawQuery = require('../utils/preCleanRawQuery');
const monolingual = require('../utils/monolingualize');
const includeLabelsInEvent = require('../utils/includeLabelsInEvent');
const toSortTimingFormat = require('../utils/toSortTimingFormat');
const cleanRequestedAggregation = require('../utils/cleanRequestedAggregation');
const geoInFx = require('./service/parsers/geoJSON.in.json');
const geoOutFx = require('./service/parsers/geoJSON.out.json');
const BMFormSchema = require('./fixtures/applied/bordeaux-metropole.schema.json');
const BMSampleEvents = require('./fixtures/applied/bordeaux-metropole.2134211.10.json');

function dateStrFromNow(count = 0) {
  const d = moment().add(count, 'day').toDate();

  return JSON.stringify(d).replace(/"/g, '');
}

const fx = {
  geo: {
    in: geoInFx,
    out: geoOutFx,
  },
  formSchema: BMFormSchema,
  multilingualLabelledEvent: BMSampleEvents.events[0],
};

describe('event-search - unit: utils', () => {
  describe('appendFirstNextAndLastTiming', () => {
    it('returns object decorated with next and last timing', () => {
      const next = {
        begin: dateStrFromNow(1),
        end: dateStrFromNow(1),
      };

      const last = {
        begin: dateStrFromNow(3),
        end: dateStrFromNow(3),
      };

      const { nextTiming, lastTiming } = appendFirstNextAndLastTiming({
        timings: [{
          begin: dateStrFromNow(-2),
          end: dateStrFromNow(-2),
        }, {
          begin: dateStrFromNow(-1),
          end: dateStrFromNow(-1),
        }, next, {
          begin: dateStrFromNow(2),
          end: dateStrFromNow(2),
        }, last],
      });

      expect(nextTiming).toEqual(next);
      expect(lastTiming).toEqual(last);
    });
  });

  describe('monolingual', () => {
    it('if an empty array is provided, filter is not applied', () => {
      const h = monolingual.bind(null, ['title'], []);

      const result = h({
        title: {
          fr: 'La guerre des gaules',
          en: 'War of the Gauls',
        },
      });

      expect(result).toEqual({
        title: {
          fr: 'La guerre des gaules',
          en: 'War of the Gauls',
        },
      });
    });

    it(
      'returns object with specified fields set from multilingual to monolingual',
      () => {
        const h = monolingual.bind(null, ['title', 'description', 'registration'], 'fr');

        const result = h({
          title: { fr: 'Gros', en: 'Fat' },
          description: { fr: 'Bonjour', en: 'Hello' },
          registration: null,
        });

        expect(result).toEqual({
          title: 'Gros',
          description: 'Bonjour',
          registration: null,
        });
      },
    );

    it('following languages are considered as fallback languages', () => {
      const h = monolingual.bind(null, ['title', 'description', 'registration'], ['es', 'en']);

      const result = h({
        title: {
          fr: 'Un cheval',
          es: 'Un caballo',
          en: 'A horse',
        },
        description: {
          fr: 'Une vache',
          en: 'A cow',
        },
      });

      expect(result).toEqual({
        title: 'Un caballo',
        description: 'A cow',
      });
    });

    it('unset field is ignored', () => {
      const h = monolingual.bind(null, ['title', 'description'], ['es', 'en']);

      expect(h({
        title: { es: 'La luna llena' },
      })).toEqual({
        title: 'La luna llena',
      });
    });
  });

  describe('includeLabelsInEvent', () => {
    it('replaces option id with label/id pairs', () => {
      const event = includeLabelsInEvent({ formSchema: fx.formSchema }, fx.multilingualLabelledEvent);

      expect(
        event['categories-agenda-metropolitain'],
      ).toEqual(
        {
          id: 53,
          label: { fr: 'Fête - Festival' },
        },
      );
    });

    it(
      'if monolingual option is specified, labels are flattened to requested lang when possible',
      () => {
        const event = includeLabelsInEvent({
          formSchema: fx.formSchema,
          monolingual: 'fr',
        }, fx.multilingualLabelledEvent);

        expect(
          event['categories-agenda-metropolitain'],
        ).toEqual(
          {
            id: 53,
            label: 'Fête - Festival',
          },
        );
      },
    );

    it(
      'if monolingual option is specified but corresponding label is not multilingual, available label is provided',
      () => {
        const event = includeLabelsInEvent({
          formSchema: {
            fields: [{
              field: 'categories',
              options: [{
                id: 1,
                label: 'Spectacle',
              }],
            }],
          },
          monolingual: 'fr',
        }, {
          categories: [1],
        });

        expect(
          event.categories,
        ).toEqual(
          [{
            id: 1,
            label: 'Spectacle',
          }],
        );
      },
    );

    it(
      'if monolingual option is specified but corresponding label does not include corresponding language, available label is provided',
      () => {
        const event = includeLabelsInEvent({
          formSchema: {
            fields: [{
              field: 'categories',
              options: [{
                id: 1,
                label: {
                  en: 'Spectacle',
                },
              }],
            }],
          },
          monolingual: 'fr',
        }, {
          categories: 1,
        });

        expect(event.categories).toEqual({
          id: 1,
          label: 'Spectacle',
        });
      },
    );
  });

  describe('convertToLocalTimezone', () => {
    it(
      'when timings and local timezone are available in event, timings are converted',
      () => {
        expect(convertToLocalTimezone({
          timings: [{
            begin: '2016-10-24T12:00:00.000Z',
            end: '2016-10-24T13:00:00.000Z',
          }],
          timezone: 'Europe/Paris',
        })).toEqual({
          timings: [{
            begin: '2016-10-24T14:00:00+02:00',
            end: '2016-10-24T15:00:00+02:00',
          }],
          timezone: 'Europe/Paris',
        });
      },
    );
  });

  describe('preCleanRawQuery', () => {
    it('converts state to numbers when strings are provided', () => {
      expect(preCleanRawQuery({
        state: ['1', '0'],
      })).toEqual({
        state: [1, 0],
      });
    });

    it('converts empty string given in uid list into -1', () => {
      expect(preCleanRawQuery({
        uid: [''],
      })).toEqual({ uid: [-1] });
    });

    it('converts object of uids into list', () => {
      expect(preCleanRawQuery({
        uid: {
          0: '456',
          1: '789',
        },
      })).toEqual({ uid: [456, 789] });
    });

    it('replaces date with timings', () => {
      expect(preCleanRawQuery({
        city: 'Courbevoie',
        date: {
          gte: '2020-11-03',
        },
      })).toEqual({
        city: 'Courbevoie',
        timings: {
          gte: '2020-11-03',
        },
      });
    });
  });

  describe('getDSLSortPart', () => {
    const now = toSortTimingFormat(new Date());
    it('default is sort by timings future asc, passed desc', () => {
      expect(
        getDSLSortPart(),
      ).toEqual([{
        '_sort_timings.begin': {
          mode: 'min',
          order: 'asc',
          nested: {
            path: '_sort_timings',
            filter: {
              range: {
                '_sort_timings.accessible_until': {
                  gte: now,
                },
              },
            },
          },
        },
      }, {
        _search_last_timing: { order: 'desc' },
      }, {
        uid: { order: 'asc' },
      }]);
    });

    it('sort can be on a mapped field', () => {
      expect(
        getDSLSortPart({ sort: 'featured.desc' }),
      ).toEqual(
        [{
          featured: 'desc',
        }, {
          uid: {
            order: 'asc',
          },
        }],
      );
    });

    it('sort can be on multiple mapped fields', () => {
      expect(
        getDSLSortPart({
          sort: ['featured.desc', 'updatedAt.asc'],
        }),
      ).toEqual(
        [{
          featured: 'desc',
        }, {
          updatedAt: 'asc',
        }, {
          uid: {
            order: 'asc',
          },
        }],
      );
    });

    it('if sort is by score, score and uid are defined in DSL', () => {
      expect(getDSLSortPart({ sort: 'score' })).toEqual(['_score', { uid: { order: 'asc' } }]);
    });
  });

  describe('validateNav', () => {
    it('distinguishes types in after key', () => {
      expect(
        validateNav({
          after: ['0', '00019383920', '2981893', 'null'],
        }),
      ).toEqual({
        from: 0,
        searchAfter: [0, '00019383920', 2981893, null],
        size: 20,
      });
    });

    it('throws BadRequest if from+size exceeds provided max', () => {
      let error;
      try {
        validateNav({
          from: 10,
          size: 10,
        }, { maxResultWindow: 19 });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.message).toBe('from + size cannot exceed 19. Use "after" navigation for better performance.');
    });
  });

  describe('validateQuery', () => {
    it('throws error when slug is empty string', () => {
      let error;
      try {
        validateQuery({
          slug: [''],
        }, {});
      } catch (e) {
        error = e;
      }
      expect(error[0].code).toBe('string.tooshort');
    });

    it('CountryCode null is valid', () => {
      const clean = validateQuery({ countryCode: ['null', 'FR'] }, {});
      expect(clean.countryCode).toStrictEqual(['FR', 'null']);
    });
  });

  describe('cleanRequestedAggregation', () => {
    it('af is additionalFields', () => {
      const clean = cleanRequestedAggregation({}, {
        type: 'af',
      });

      expect(clean).toEqual({
        type: 'additionalFields',
      });
    });

    it('t is type', () => {
      const clean = cleanRequestedAggregation({}, {
        t: 'af',
      });

      expect(clean).toEqual({
        type: 'additionalFields',
      });
    });

    it('s is size', () => {
      expect(
        cleanRequestedAggregation({}, {
          s: 2000,
        }),
      ).toEqual({
        size: 2000,
      });
    });

    it('k is key, f is field', () => {
      expect(
        cleanRequestedAggregation({}, {
          k: 'keyword',
          f: 'keyword',
        }),
      ).toEqual({
        key: 'keyword',
        field: 'keyword',
      });
    });

    it('m is missing', () => {
      expect(
        cleanRequestedAggregation({}, {
          m: 'N/A',
        }),
      ).toEqual({
        missing: 'N/A',
      });
    });

    it('if aggsSizeLimit is provided, size limit is added to aggregation', () => {
      expect(
        cleanRequestedAggregation({ aggsSizeLimit: 1000 }, {
          k: 'locations',
          m: 'N/A',
        }),
      ).toEqual({
        key: 'locations',
        size: 1000,
        missing: 'N/A',
      });
    });
  });

  describe('other', () => {
    it('geoJSON post parsers transforms search result into geoJSON data', () => {
      expect(geoJSON(fx.geo.in)).toEqual(fx.geo.out);
    });

    it('derelativize - converts relative term with absolute', () => {
      const query = derelativize({
        date: {
          gte: 'today',
          timezone: 'Europe/Paris',
        },
      });

      expect(query.date.gte instanceof Date).toBe(true);
    });
  });
});
