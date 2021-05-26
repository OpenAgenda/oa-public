'use strict';

const assert = require('assert');
const fromItemToEntry = require('../fields/fromItemToEntry');
const eventsFields = require('./fixtures/db/eventsFields');
const locationsFields = require('./fixtures/db/locationsFields');
const fixtures = require('./fixtures/db');


describe('utils - fromItemToEntry', () => {
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

/*   describe('Locations', ()=> {

    it('placeName', ()=> {
      const entry = fromItemToEntry(locationsFields, {name: 'The Name'});
      assert.deepStrictEqual(entry, {placename: 'The Name'})
    })

    it('image && imageCredits', ()=> {
      const entry = fromItemToEntry(locationsFields, {image: '//cibuldev.s3.amazonaws.com/location36419450.jpg', imageCredits: 'me'});
      assert.deepStrictEqual(entry, {store: {
        image: '//cibuldev.s3.amazonaws.com/location36419450.jpg',
        imageCredits: 'me'
      }})
    })

    it('id', ()=> {
      const entry = fromItemToEntry(locationsFields, {"id": 834568});
      assert.deepStrictEqual(entry, { id: 834568})
    })

  }) */
});