"use strict";

const assert = require('assert');
const decorateWithCounts = require('../lib/decorateWithCounts');

describe('utils', () => {

  describe('decorateWithCounts', () => {

    it('adds given counts to matching location', () => {
      const locations = [{
        uid: 111,
        name: 'Le Monop'
      }, {
        uid: 112,
        name: 'Le Prisu'
      }];

      decorateWithCounts(locations, [{
        uid: 112,
        agendaEventCount: 12,
        eventCount: 24
      }]);

      assert.deepEqual(locations, [{
        uid: 111,
        name: 'Le Monop',
        eventCount: 0,
        agendaEventCount: 0
      }, {
        uid: 112,
        name: 'Le Prisu',
        agendaEventCount: 12,
        eventCount: 24
      }]);
    });

  });

});
