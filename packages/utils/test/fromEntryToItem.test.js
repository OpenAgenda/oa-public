'use strict';

const assert = require('assert');
const fromEntryToItem = require('../fields/fromEntryToItem');
const eventsFields = require('./fixtures/db/eventsFields');
const locationsFields = require('./fixtures/db/locationsFields');
const eventEntry = require('./fixtures/db/eventEntry');
const fixtures = require('./fixtures/db');

describe('utils - fromEntryToItem', () => {
  describe('Events', () => {

    it('image', () => {
      let item = fromEntryToItem(eventsFields, {
        image: '{"filename":"950de3a396df447dbb66364d036e0067.base.image.jpg","credits":"MEL","size":{"height":344,"width":700},"variants":[{"type":"full","filename":"950de3a396df447dbb66364d036e0067.full.image.jpg","size":{"height":344,"width":700}},{"type":"thumbnail","filename":"950de3a396df447dbb66364d036e0067.thumb.image.jpg","size":{"height":200,"width":200}}]}',
      });
      assert.deepStrictEqual(item.image, { "credits": "MEL", "filename": "950de3a396df447dbb66364d036e0067.base.image.jpg", "size": { "height": 344, "width": 700 }, "variants": [{ "filename": "950de3a396df447dbb66364d036e0067.full.image.jpg", "size": { "height": 344, "width": 700 }, "type": "full" }, { "filename": "950de3a396df447dbb66364d036e0067.thumb.image.jpg", "size": { "height": 200, "width": 200 }, "type": "thumbnail" }] });
    })

    it('title is multilingual value', () => {
      let item;
      item = fromEntryToItem(eventsFields, eventEntry, {});
      assert.equal(item.title.fr, 'ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »');
    });

  })

  describe('Locations', () => {

    it('set Uid', () => {
      let item = fromEntryToItem([{
        field: 'setUid',
        fieldType: 'integer',
        optional: true,
        default: null,
        read: ['internal', 'public'],
        write: ['internal']
      }], {
        set_uid: 12
      })
      assert.deepStrictEqual(item.setUid, 12);
    })

    it('image', () => {
      let item = fromEntryToItem([
        {
          field: 'image',
          optional: true,
          db: {
            type: 'json',
            field: 'store.image',
            assign: true
          },
          read: ['internal', 'public'],
          write: ['internal', 'administrator', 'moderator', 'contributor'],
          fieldType: 'stream',
          'allowNull': true
        }, {
          field: 'imageCredits',
          optional: true,
          db: {
            type: 'json',
            field: 'store.imageCredits',
            assign: true
          },
          fieldType: 'text',
          read: ['internal', 'public'],
          write: ['internal', 'administrator', 'moderator', 'contributor'],
          enableWith: 'image'
        }
      ], { store: "{\"image\":\"location36419450.jpg\" ,\"imageCredits\":\"© Château d'Alba-la-Romaine\"}"});
      assert.deepStrictEqual(item, {"image": "location36419450.jpg", "imageCredits": "© Château d'Alba-la-Romaine"});
    })

  })
});