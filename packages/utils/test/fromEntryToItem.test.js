'use strict';

const fromEntryToItem = require('../fields/fromEntryToItem');
const eventsFields = require('./fixtures/db/eventsFields');
const eventEntry = require('./fixtures/db/eventEntry');

describe('utils - fromEntryToItem', () => {
  it('nullifyUndefined sets empty values to null', () => {
    const item = fromEntryToItem([{
      field: 'image',
      read: ['public']
    }], {}, { nullifyUndefined: true });

    expect(item.image).toBeNull();
  });

  describe('Events', () => {
    it('image', () => {
      const item = fromEntryToItem(eventsFields, {
        image: '{"filename":"950de3a396df447dbb66364d036e0067.base.image.jpg","credits":"MEL","size":{"height":344,"width":700},"variants":[{"type":"full","filename":"950de3a396df447dbb66364d036e0067.full.image.jpg","size":{"height":344,"width":700}},{"type":"thumbnail","filename":"950de3a396df447dbb66364d036e0067.thumb.image.jpg","size":{"height":200,"width":200}}]}',
      });
      expect(item.image).equal({
        credits: 'MEL',
        filename: '950de3a396df447dbb66364d036e0067.base.image.jpg',
        size: {
          height: 344,
          width: 700
        },
        variants: [{
          filename: '950de3a396df447dbb66364d036e0067.full.image.jpg',
          size: {
            height: 344,
            width: 700
          },
          type: 'full'
        }, {
          filename: '950de3a396df447dbb66364d036e0067.thumb.image.jpg',
          size: {
            height: 200,
            width: 200
          },
          type: 'thumbnail'
        }]
      });
    });

    it('title is multilingual value', () => {
      expect(
        fromEntryToItem(eventsFields, eventEntry, {}).title.fr
      ).toBe('ANNULÉ : Spectacle « Les ombres racontent : Kirikou et autres histoires »');
    });
  });

  describe('Locations', () => {
    it('set Uid', () => {
      const item = fromEntryToItem([{
        field: 'setUid',
        fieldType: 'integer',
        optional: true,
        default: null,
        read: ['internal', 'public'],
        write: ['internal']
      }], {
        set_uid: 12
      });
      expect(item.setUid).toBe(12);
    });

    it('image', () => {
      const item = fromEntryToItem([
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
          allowNull: true
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
      ], {
        store: "{\"image\":\"location36419450.jpg\" ,\"imageCredits\":\"© Château d'Alba-la-Romaine\"}"
      });

      expect(item).toEqual({
        image: 'location36419450.jpg',
        imageCredits: '© Château d\'Alba-la-Romaine'
      });
    });
  });
});
