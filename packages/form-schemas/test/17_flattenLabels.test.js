'use strict';

const flattenLabels = require('../client/src/lib/flatten');
// const unflattenLabels = require('../client/src/FormSchemaBuilder/lib/unflattenLabels');

describe('17 - unit - flatten labels', () => {
  it('flattens field labels', () => {
    const flattened = flattenLabels({
      label: {
        fr: 'Un champ',
        en: 'A field'
      },
      info: {
        fr: 'Un peu plus sur le champ',
        en: 'A bit more about the field'
      }
    }, 'fr');

    expect(flattened).toStrictEqual({
      label: 'Un champ',
      info: 'Un peu plus sur le champ'
    });
  });

  it('flattens option values of field', () => {
    const flattened = flattenLabels({
      label: {
        fr: 'Un autre champ',
        en: 'Another field'
      },
      options: [{
        label: {
          fr: 'Un'
        }
      }, {
        label: {
          fr: 'Deux'
        }
      }]
    });

    expect(flattened).toStrictEqual({
      label: 'Un autre champ',
      options: [{
        label: 'Un'
      }, {
        label: 'Deux'
      }]
    });
  });

  it('does not flatten option values if already flat', () => {
    const flattened = flattenLabels({
      options: [{
        label: 'Un'
      }, {
        label: 'Deux'
      }]
    });

    expect(flattened).toStrictEqual({
      options: [{
        label: 'Un'
      }, {
        label: 'Deux'
      }]
    });
  });
});
