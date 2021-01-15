'use strict';

const assert = require('assert');
const fromItemToDbEntry = require('../lib/fromItemToDbEntry');

describe('fromItemToDbEntry', () => {

  it('title is jsonified', () => {
    const entry = fromItemToDbEntry({
      title: {
        fr: 'Un événement'
      }
    });

    assert.equal(entry.title, '{"fr":"Un événement"}');
  });

  it('longDescription field is underscored', () => {
    const entry = fromItemToDbEntry({
      longDescription: {
        fr: 'Une description longue'
      }
    });

    assert.equal(entry.long_description, '{"fr":"Une description longue"}');
  });

  it('image credits is placed in a object in the image field', () => {
    const entry = fromItemToDbEntry({
      image: 'image.jpg',
      imageCredits: 'Gaetan Latouche 2020'
    });

    assert.equal(entry.image, '{"filename":"image.jpg","credits":"Gaetan Latouche 2020"}');
  });

  it('if only image is specified and credits are already loaded in current entry, credits are not overwritten', () => {
    const entry = fromItemToDbEntry({
      image: 'image.maj.jpg'
    }, {
      image: 'image.jpg',
      imageCredits: 'Gaetan Latouche 2020'
    });

    assert.equal(entry.image, '{"filename":"image.maj.jpg","credits":"Gaetan Latouche 2020"}');
  });

  it('if image is null it should be null in entry', () => {
    const entry = fromItemToDbEntry({
      image: null
    }, {
      image: {
        filename: 'image.png'
      }
    });

    assert.equal(entry.image, null);
  });

  it('new timings replace previous timings', () => {
    const entry = fromItemToDbEntry({
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
    const entry = fromItemToDbEntry({
      registration: null,
    });
  });


  it('null is set on json field with subfield', () => {
    const entry = fromItemToDbEntry({
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

});
