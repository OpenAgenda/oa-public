"use strict";

const _ = require('lodash');
const moment = require('moment');
const assert = require('assert');

const appendNextAndLastTiming = require('../utils/appendNextAndLastTiming');
const convertToLocalTimezone = require('../utils/convertToLocalTimezone');
const derelativize = require('../utils/derelativize');
const geoJSON = require('../utils/geoJSON');
const getDSLSortPart = require('../utils/getDSLSortPart');
const preCleanRawQuery = require('../utils/preCleanRawQuery');
const monolingual = require('../utils/monolingualize');
const includeLabelsInEvent = require('../utils/includeLabelsInEvent');

const config = require('../testconfig');
const Service = require('../');

const fx = {
  geo: {
    in: require('./service/parsers/geoJSON.in.json'),
    out: require('./service/parsers/geoJSON.out.json')
  },
  formSchema: require('./fixtures/applied/bordeaux-metropole.schema.json'),
  multilingualLabelledEvent: require('./fixtures/applied/bordeaux-metropole.2134211.10.json').events[0]
};

describe('event-search - unit: utils', function() {

  this.timeout(10000);

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

      assert.deepEqual(nextTiming, next);
      assert.deepEqual(lastTiming, last);
    });
  });

  describe('monolingual', () => {

    it('if an empty array is provided, filter is not applied', () => {
      const h = monolingual.bind(null, ['title'], []);

      const result = h({
        title: {
          fr: 'La guerre des gaules',
          en: 'War of the Gauls'
        }
      });

      assert.deepEqual(result, {
        title: {
          fr: 'La guerre des gaules',
          en: 'War of the Gauls'
        }
      });
    });

    it('returns object with specified fields set from multilingual to monolingual', () => {

      const h = monolingual.bind(null, ['title', 'description', 'registration'], 'fr');

      const result = h({
        title: { fr: 'Gros', en: 'Fat' },
        description: { fr: 'Bonjour', en: 'Hello' },
        registration: null
      });

      assert.deepEqual(result, {
        title: 'Gros',
        description: 'Bonjour',
        registration: null
      });
    });

    it('following languages are considered as fallback languages', () => {
      const h = monolingual.bind(null, ['title', 'description', 'registration'], ['es', 'en']);

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

      assert.deepEqual(result, {
        title: 'Un caballo',
        description: 'A cow'
      });
    });

    it('unset field is ignored', () => {
      const h = monolingual.bind(null, ['title', 'description'], ['es', 'en']);

      assert.deepEqual(h({
        title: { es: 'La luna llena' }
      }), {
        title: 'La luna llena'
      });
    });

  });

  describe('includeLabelsInEvent', () => {
    it('replaces option id with label/id pairs', () => {
      const event = includeLabelsInEvent({ formSchema: fx.formSchema }, fx.multilingualLabelledEvent);

      assert.deepEqual(
        event['categories-agenda-metropolitain'],
        {
          id: 53,
          label: { fr: 'Fête - Festival' }
        }
      );
    });

    it('if monolingual option is specified, labels are flattened to requested lang when possible', () => {
      const event = includeLabelsInEvent({
        formSchema: fx.formSchema,
        monolingual: 'fr'
      }, fx.multilingualLabelledEvent);

      assert.deepEqual(
        event['categories-agenda-metropolitain'],
        {
          id: 53,
          label: 'Fête - Festival'
        }
      );
    });

    it('if monolingual option is specified but corresponding label is not multilingual, available label is provided', () => {
      const event = includeLabelsInEvent({
        formSchema: {
          fields: [{
            field: 'categories',
            options: [{
              id: 1,
              label: 'Spectacle'
            }]
          }]
        },
        monolingual: 'fr'
      }, {
        categories: [1]
      });

      assert.deepEqual(
        event.categories,
        [{
          id: 1,
          label: 'Spectacle'
        }]
      )
    });

    it('if monolingual option is specified but corresponding label does not include corresponding language, available label is provided', () => {
      const event = includeLabelsInEvent({
        formSchema: {
          fields: [{
            field: 'categories',
            options: [{
              id: 1,
              label: {
                en: 'Spectacle'
              }
            }]
          }]
        },
        monolingual: 'fr'
      }, {
        categories: 1
      });

      assert.deepEqual(event.categories, {
        id: 1,
        label: 'Spectacle'
      });
    });
  });

  describe('convertToLocalTimezone', () => {
    it('when timings and local timezone are available in event, timings are converted', () => {
      assert.deepEqual(convertToLocalTimezone({
        timings: [{
          begin: '2016-10-24T12:00:00.000Z',
          end: '2016-10-24T13:00:00.000Z'
        }],
        timezone: 'Europe/Paris'
      }), {
        timings: [{
          begin: '2016-10-24T14:00:00+02:00',
          end: '2016-10-24T15:00:00+02:00'
        }],
        timezone: 'Europe/Paris'
      });
    });
  });

  describe('preCleanRawQuery', () => {
    it('converts state to numbers when strings are provided', () => {
      assert.deepEqual(preCleanRawQuery({
        state: ['1', '0']
      }), {
        state: [1, 0]
      });
    });

    it('converts empty string given in uid list into -1', () => {
      assert.deepEqual(preCleanRawQuery({
        uid: ['']
      }), { uid: [-1] });
    });

    it('converts object of uids into list', () => {
      assert.deepEqual(preCleanRawQuery({
        uid: {
          '0': '456',
          '1': '789'
        }
      }), { uid: [456, 789] });
    });

    it('replaces date with timings', () => {
      assert.deepEqual(preCleanRawQuery({
        city: 'Courbevoie',
        date: {
          gte: '2020-11-03'
        }
      }), {
        city: 'Courbevoie',
        timings: {
          gte: '2020-11-03'
        }
      });
    });
  });

  describe('getDSLSortPart', () => {

    it('default is sort by timings future asc, passed desc', () => {
      assert.deepEqual(
        getDSLSortPart(), [{
          '_search_timings.accessible_until': {
            mode: 'min',
            order: 'asc',
            nested: {
              path: '_search_timings',
              filter: {
                range: {
                  '_search_timings.accessible_until': {
                    gte: 'now'
                  }
                }
              }
            }
          }
        }, {
          _search_last_timing: { order: 'desc' }
        }, {
          uid: { order: 'asc' }
        }]
      );
    });

    it('sort can be on a mapped field', () => {
      assert.deepEqual(
        getDSLSortPart('featured.desc'),
        [{
          featured: 'desc'
        }, {
          uid: {
            order: 'asc'
          }
        }]
      );
    });

    it('sort can be on multiple mapped fields', () => {
      assert.deepEqual(
        getDSLSortPart(['featured.desc', 'updatedAt.asc']),
        [{
          featured: 'desc'
        }, {
          updatedAt: 'asc'
        }, {
          uid: {
            order: 'asc'
          }
        }]
      );
    });

    it('if sort is by score, no explicit score is passed to elasticsearch DSL', () => {
      assert.equal(getDSLSortPart('score'), null);
    });
  });

  describe('other', () => {
    it('geoJSON post parsers transforms search result into geoJSON data', () => {
      assert.deepEqual(geoJSON(fx.geo.in), fx.geo.out);
    });

    it('derelativize - converts relative term with absolute', () => {
      const query = derelativize({
        date: {
          gte: 'today',
          timezone: 'Europe/Paris'
        }
      });

      assert.equal(query.date.gte instanceof Date, true);
    });
  });

});

function _dateStrFromNow(count = 0) {
  const d = moment().add(count, 'day').toDate();

  return JSON.stringify(d).replace(/"/g, '');
}
