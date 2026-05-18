import assert from 'node:assert';
import formatCibulModelEvent from '../formatCibulModelEvent.js';
import onlyInEnglish from './fixtures/cibulModelEvent.json' with { type: 'json' };
import englishAndFrench from './fixtures/cibulModelEvent.2.json' with { type: 'json' };
import incomplete from './fixtures/cibulModelEvent.3.json' with { type: 'json' };

describe('formatCibulModelEvent', () => {
  test('takes available language if requested does not exist at all', () => {
    const e = formatCibulModelEvent(onlyInEnglish, 'fr');

    assert.deepEqual(e, {
      title: 'this is a test',
      description: 'test',
      freeText: 'test',
      tags: 'test',
    });
  });

  test('takes requested language if is set', () => {
    const e = formatCibulModelEvent(englishAndFrench, 'fr');

    assert.deepEqual(e, {
      title: 'Le test',
      description: 'un test',
      freeText: undefined,
      tags: undefined,
    });
  });

  test('not all fields need to be set', () => {
    const e = formatCibulModelEvent(incomplete, 'fr');

    assert.deepEqual(e, {
      title: 'FOUR A CHAUX DE VENESMES 18190 LIEU DIT ECLENEUIL',
      description: "VISITE D'UN SITE INDUSTRIEL",
      freeText: 'VISITE DU SITE',
    });
  });
});
