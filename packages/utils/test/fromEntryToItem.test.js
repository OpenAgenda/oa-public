'use strict';

const assert = require('assert');
const fromEntryToItem = require('../fields/fromEntryToItem');
const eventsFields = require('./fixtures/db/eventsFields');
const locationsFields = require('./fixtures/db/locationsFields');
const eventEntry = require('./fixtures/db/eventEntry');
const fixtures = require('./fixtures/db');

describe('utils - fromEntryToItem', () => {
  describe('Events', ()=> {
    let item;
    item = fromEntryToItem(eventsFields, eventEntry, {});
  
  
    it('title is multilingual value', () => {
      assert.equal(item.title.fr, 'ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »');
    });
  })

/*   describe('Locations', ()=> {
    it('big test', () => {
    assert.deepStrictEqual(
        fromEntryToItem(locationsFields, fixtures.alba.entry, {
          imagePath: '//cibuldev.s3.amazonaws.com/',
        }),
        fixtures.alba.item
      );
    })
  }) */
});