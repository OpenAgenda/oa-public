'use strict';

const assert = require('assert');

const fromDbEntryToItem = require('../lib/fromDbEntryToItem');
const fixtures = require('./fixtures/fromDbEntryToItem');

describe('agenda-locations - unit - fromDbEntryToItem', () => {

  it('Case 1', () => {
    assert.deepEqual(fromDbEntryToItem(fixtures.alba.entry, {
      imagePath: '//cibuldev.s3.amazonaws.com/'
    }), fixtures.alba.item);
  });

});
