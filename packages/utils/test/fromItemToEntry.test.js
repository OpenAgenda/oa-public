'use strict';

const assert = require('assert');
const fromItemToEntry = require('../fields/fromItemToEntry');
const eventsFields = require('./fixtures/db/eventsFields');
const locationsFields = require('./fixtures/db/locationsFields');
const fixtures = require('./fixtures/db');

describe('utils - fromItemToEntry', () => {
  describe('db key', () => {
    it('when defined, format function is used to transform data', () => {
      const { image } = fromItemToEntry([{
        field: 'image',
        db: {
          format: data => typeof data.image === 'string' ? { filename: data.image } : data.image,
          type: 'json',
          fields: 'image'
        }
      }], { image: 'image.jpg' });

      expect(image).toEqual('{"filename":"image.jpg"}');
    });

    it('use case: extId on location service in field', () => {
      const entry = fromItemToEntry([{
        field: 'extId',
        fieldType: 'text',
      }], {extId: 10})
      expect(entry.ext_id).toEqual(10);
    })
  });


  describe('Events', ()=> {
    it('title is jsonified', () => {
      const entry = fromItemToEntry(eventsFields, {
        title: {
          fr: 'Un événement'
        }
      });
  
      assert.equal(entry.title, '{"fr":"Un événement"}');
    });
 
    it('longDescription field is underscored', () => {
      const entry = fromItemToEntry(eventsFields, {
        longDescription: {
          fr: 'Une description longue'
        }
      });
  
      assert.equal(entry.long_description, '{"fr":"Une description longue"}');
    });
  
    it('image credits is placed in a object in the image field', () => {
      const entry = fromItemToEntry(eventsFields, {
        image: 'image.jpg',
        imageCredits: 'Gaetan Latouche 2020'
      });
  
      assert.equal(entry.image, '{"filename":"image.jpg","credits":"Gaetan Latouche 2020"}');
    });
  
    it('if only image is specified and credits are already loaded in current entry, credits are not overwritten', () => {
      const entry = fromItemToEntry(eventsFields, {
        image: 'image.maj.jpg'
      }, {
        image: 'image.jpg',
        imageCredits: 'Gaetan Latouche 2020'
      });
  
      assert.equal(entry.image, '{"filename":"image.maj.jpg","credits":"Gaetan Latouche 2020"}');
    });
  
    it('if image is null it should be null in entry', () => {
      const entry = fromItemToEntry(eventsFields, {
        image: null
      }, {
        image: {
          filename: 'image.png'
        }
      });
  
      assert.equal(entry.image, null);
    });

    it('draft can be undrafted', () => {
      const entry = fromItemToEntry(
        [{
          field: 'draft',
          fieldTYpe: 'boolean'
        }],
        {
          draft: false
        },
        {
          draft: true
        }
      );

      expect(entry.draft).toBe(false);
    });
  
    it('new timings replace previous timings', () => {
      const entry = fromItemToEntry(eventsFields, {
        timings: [{
          begin:'2020-10-10T08:00:00.000Z',
          end:'2020-10-10T20:00:00.000Z'
        }]
      }, {
        timings: [{
          begin: '2020-11-22T13:00:00.000+01:00',
          end: '2020-11-22T13:30:00.000+01:00'
        }]
      });
  
      assert.equal(entry.timings, '[{"begin":"2020-10-10T08:00:00.000Z","end":"2020-10-10T20:00:00.000Z"}]');
    });
  
    it('null is given as null in entry', () => {
      const entry = fromItemToEntry(eventsFields, {
        registration: null,
      });
    });
  
  
    it('null is set on json field with subfield', () => {
      const entry = fromItemToEntry(eventsFields, {
        image: null,
        imageCredits: null
      }, {
        image: {
          filename: '5f9bbe1df90a43a8a059a56ad6e26c2a.base.image.jpg',
          base: 'https://cibuldev.s3.amazonaws.com/'
        },
        imageCredits: null
      });
      
      assert.deepEqual(entry.image, '{"credits":null}');
    });
  
    it('JSON object key can be emptied', () => {
      const entry = fromItemToEntry(eventsFields, {
        longDescription: {},
      }, {
        longDescription: { fr: 'gfdsgfdsgfdsgfds\nfdqsfdsq\nfqds' }
      });
  
      assert.equal(entry.long_description, '{}');
    });
  })

  describe('Locations', ()=> {

    it('name to placeName', ()=> {
      const entry = fromItemToEntry([ {
        field: 'name',
        db: 'placename',
        optional: false,
        read: ['internal', 'public', 'list', 'terms'],
        write: ['internal', 'administrator', 'moderator', 'contributor'],
        fieldType: 'text',
        max: 100
      }], {name: 'The Name'});
      assert.deepStrictEqual(entry, {placename: 'The Name'})
    })

    it('image && imageCredits', ()=> {
      const entry = fromItemToEntry([
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
      ], {image: '//cibuldev.s3.amazonaws.com/location36419450.jpg', imageCredits: 'me'});
      assert.deepStrictEqual(entry.store, "{\"image\":\"//cibuldev.s3.amazonaws.com/location36419450.jpg\",\"imageCredits\":\"me\"}")
    })

    it('candidates && confirmedNonDuplicates- keep non changed store items', ()=> {
      const entry = fromItemToEntry([ {
        field: 'duplicateCandidates',
        fieldType: 'integer',
        list: true,
        default: null,
        db: {
          assign: true,
          type: 'json',
          field: 'duplicates.candidates',
        },
        optional: true,
        read: ['internal', 'public'],
        write: ['internal', 'contributor']
      }, {
        field: 'disqualifiedDuplicates',
        fieldType: 'integer',
        list: true,
        default: null,
        db: {
          assign: true,
          type: 'json',
          field: 'duplicates.disqualified',
        },
        optional: true,
        read: ['internal', 'public'],
        write: ['internal', 'contributor']
      }
      ], { duplicateCandidates: [1,2] }, { duplicateCandidates: [3,4], disqualifiedDuplicates: [5,6] });
      assert.deepStrictEqual(entry.duplicates, "{\"candidates\":[1,2],\"disqualified\":[5,6]}")
    })

    it('adminLevel defined', () => {
      const entry = fromItemToEntry([
        {
          field: 'city',
          optional: true,
          fieldType: 'text',
          read: ['internal', 'public', 'terms'],
          write: ['internal', 'administrator', 'moderator', 'contributor'],
          max: 100
        }, {
          field: 'adminLevel4',
          optional: true,
          fieldType: 'text',
          db: 'city',
          read: ['internal', 'public', 'terms'],
          write: ['internal', 'administrator', 'moderator', 'contributor'],
          max: 100
        }], { adminLevel4: 'Admin4 Name', city: null });
      expect(entry.city).toBe('Admin4 Name');
    });

    it('adminLevel undefined', () => {
      const fct = fromItemToEntry.loadWithLinkedFields([{
        field: 'city',
        optional: true,
        fieldType: 'text',
        read: ['internal', 'public', 'terms'],
        write: ['internal', 'administrator', 'moderator', 'contributor'],
        max: 100
      }, {
        field: 'adminLevel4',
        optional: true,
        fieldType: 'text',
        db: 'city',
        read: ['internal', 'public', 'terms'],
        write: ['internal', 'administrator', 'moderator', 'contributor'],
        max: 100
      }]);
      const entry = fct({ adminLevel4: null, city: 'City Name' });
      expect(entry.city).toBe('City Name');
    });
  });
});
