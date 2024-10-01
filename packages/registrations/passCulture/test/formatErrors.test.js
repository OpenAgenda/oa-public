import formatErrors from '../lib/formatErrors.js';

describe('formatErrors', () => {
  test('problem with venueId', () => {
    expect(
      formatErrors({
        venueId: ['There is no venue with this id associated to your API key'],
      }),
    ).toEqual([
      {
        message: 'failed to create pass offer',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.unknownVenueId',
        label: 'Le lieu choisi est inconnu du Pass Culture',
      },
    ]);
  });

  test('problem with related category', () => {
    expect(
      formatErrors({
        categoryRelatedFields: [
          "No match for discriminator 'subcategory_id' and value 'CHAMPIONNATS_PIERRE_PAPIER_CISEAU' (allowed values: 'ATELIER_PRATIQUE_ART', 'CINE_PLEIN_AIR', 'CONCERT', 'CONCOURS', 'CONFERENCE', 'EVENEMENT_CINE', 'EVENEMENT_JEU', 'EVENEMENT_MUSIQUE', 'EVENEMENT_PATRIMOINE', 'FESTIVAL_ART_VISUEL', 'FESTIVAL_CINE', 'FESTIVAL_LIVRE', 'FESTIVAL_MUSIQUE', 'FESTIVAL_SPECTACLE', 'LIVESTREAM_EVENEMENT', 'LIVESTREAM_MUSIQUE', 'LIVESTREAM_PRATIQUE_ARTISTIQUE', 'RENCONTRE_EN_LIGNE', 'RENCONTRE_JEU', 'RENCONTRE', 'SALON', 'SEANCE_CINE', 'SEANCE_ESSAI_PRATIQUE_ART', 'SPECTACLE_REPRESENTATION', 'VISITE_GUIDEE', 'VISITE')",
        ],
      }),
    ).toEqual([
      {
        message: 'failed to create pass offer',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.invalidRelatedCategory',
        label:
          "La sous-catégorie choisie n'a pas été acceptée par le Pass Culture",
      },
    ]);
  });

  test('problem with missing category label', () => {
    expect(
      formatErrors({
        'priceCategories.2.label': [
          'ensure this value has at least 1 characters',
        ],
      }),
    ).toEqual([
      {
        message: 'failed to create price categories',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.invalidPriceCategory.label',
        label: 'Toutes les catégories de prix doivent avoir un label de défini',
      },
    ]);
  });

  test('problem with dates quantity', () => {
    expect(
      formatErrors({
        'dates.2.quantity': ['Value must be positive'],
      }),
    ).toEqual([
      {
        message: 'failed to create all dates',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.invalidDate.quantity',
        label:
          "Certaines dates n'ont pas pu être créées: les quantités saisies doivent être des entiers positifs",
      },
    ]);
  });

  test('generic problem with price categories', () => {
    expect(
      formatErrors({
        'priceCategories.something': ['something'],
      }),
    ).toEqual([
      {
        message: 'failed to create all price categories',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.invalidPriceCategory',
        label: "Certaines catégories de prix n'ont pas pu être créées",
      },
    ]);
  });

  test('generic problem with dates', () => {
    expect(
      formatErrors({
        'dates.something': ['something'],
      }),
    ).toEqual([
      {
        message: 'failed to create all dates',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.invalidDate',
        label: "Certaines dates n'ont pas pu être créées",
      },
    ]);
  });

  test('unhandled Pass error', () => {
    expect(formatErrors({})).toEqual([
      {
        message: 'failed to create pass offer',
        fieldLabel: 'Pass Culture',
        code: 'registration.pass.genericError',
        label: "Il y a eu un problème lors de la création de l'offre Pass",
      },
    ]);
  });
});
