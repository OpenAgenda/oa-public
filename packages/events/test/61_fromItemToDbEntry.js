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

});
