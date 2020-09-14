'use strict';

const assert = require('assert');

const onlyInEnglish = require('./fixtures/cibulModelEvent.json');
const englishAndFrench = require('./fixtures/cibulModelEvent.2.json');
const incomplete = require('./fixtures/cibulModelEvent.3.json');

const formatCibulModelEvent = require('../formatCibulModelEvent');

describe('formatCibulModelEvent', () => {

  test('takes available language if requested does not exist at all', () => {
    const e = formatCibulModelEvent(onlyInEnglish, 'fr');

    assert.deepEqual(e, {
      title: 'this is a test',
      description: 'test',
      freeText: 'test',
      tags: 'test'
    });
  });

  test('takes requested language if is set', () => {
    const e = formatCibulModelEvent(englishAndFrench, 'fr');

    assert.deepEqual(e, {
      title: 'Le test',
      description: 'un test',
      freeText: undefined,
      tags: undefined
    });
  });

  test('not all fields need to be set', () => {
    const e = formatCibulModelEvent(incomplete, 'fr');

    assert.deepEqual(e, {
      title: 'FOUR A CHAUX DE VENESMES 18190 LIEU DIT ECLENEUIL',
      description: "VISITE D'UN SITE INDUSTRIEL",
      freeText: 'VISITE DU SITE'
    });
  });

});
