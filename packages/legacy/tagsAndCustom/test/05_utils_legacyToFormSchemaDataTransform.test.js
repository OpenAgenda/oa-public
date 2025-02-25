import assert from 'node:assert';
import legacyToFormSchemaDataTransform from '../lib/utils/legacyToFormSchemaDataTransform.js';
import roubaixtourisme from './fixtures/legacyData/roubaixtourisme.json' with { type: 'json' };

const fixtures = {
  roubaixtourisme,
};

describe('05 - utils - legacyToFormSchemaDataTransform', () => {
  it('Tourisme Roubaix can edit tags and categories - 1', () => {
    const transformed = legacyToFormSchemaDataTransform(
      {
        schema: fixtures.roubaixtourisme.schema,
        tagSet: fixtures.roubaixtourisme.tagSet,
        categorySet: fixtures.roubaixtourisme.categorySet,
        customSet: fixtures.roubaixtourisme.agenda.legacyStore.customFields,
      },
      fixtures.roubaixtourisme.body,
    );

    assert.deepEqual(transformed, {
      'categorie-annexes': [15],
      'categories-metropolitaines': [101],
      descriptionville: 'fggdfs',
      schedule_description: '15h30',
    });
  });

  it('Tourisme Roubaix - ghost tag group is ignored', () => {
    const transformed = legacyToFormSchemaDataTransform(
      {
        schema: fixtures.roubaixtourisme.schema,
        tagSet: fixtures.roubaixtourisme.tagSet,
        categorySet: fixtures.roubaixtourisme.categorySet,
        customSet: fixtures.roubaixtourisme.agenda.legacyStore.customFields,
      },
      {
        event: {
          tags: [
            {
              id: 15125,
              slug: 'spectacle',
              label: 'Spectacle',
            },
            {
              id: 15129,
              label: 'Jeune Public',
              slug: 'jeune-public',
              schemaOptionId: '374.15',
            },
            {
              id: 15739,
              label: 'Place de Marché',
              slug: 'place-de-marche',
              schemaOptionId: '374.17',
            },
            {
              id: 15115,
              label: 'Atelier',
              slug: 'atelier',
              schemaOptionId: '374.101',
            },
            {
              id: 15116,
              label: 'Braderie - Brocante',
              slug: 'braderie-brocante',
              schemaOptionId: '374.102',
            },
          ],
          custom: {
            descriptionville: 'ouaich',
            schedule_description: 'de 20h45 à 22h30',
            'reseau-metropole-de-lille': true,
          },
        },
      },
    );

    assert.deepEqual(transformed, {
      'categorie-annexes': [15],
      'categories-metropolitaines': [101, 102, 118],
      descriptionville: 'ouaich',
      schedule_description: 'de 20h45 à 22h30',
      'reseau-metropole-de-lille': true,
    });
  });
});
