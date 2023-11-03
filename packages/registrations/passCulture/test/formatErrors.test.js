import formatErrors from "../lib/formatErrors";

describe('formatErrors', () => {
  test('problem with venueId', () => {
    expect(
      formatErrors({
        venueId: [ 'There is no venue with this id associated to your API key' ]
      })
    ).toEqual([{
      message: 'failed to create pass offer',
      fieldLabel: 'Pass Culture',
      code: 'registration.pass.unknownVenueId',
      label: 'Le lieu choisi est inconnu du Pass Culture',
    }]);
  });

  test('problem with related category', () => {
    expect(
      formatErrors({
        categoryRelatedFields: [
          "No match for discriminator 'subcategory_id' and value 'CHAMPIONNATS_PIERRE_PAPIER_CISEAU' (allowed values: 'ATELIER_PRATIQUE_ART', 'CINE_PLEIN_AIR', 'CONCERT', 'CONCOURS', 'CONFERENCE', 'EVENEMENT_CINE', 'EVENEMENT_JEU', 'EVENEMENT_MUSIQUE', 'EVENEMENT_PATRIMOINE', 'FESTIVAL_ART_VISUEL', 'FESTIVAL_CINE', 'FESTIVAL_LIVRE', 'FESTIVAL_MUSIQUE', 'FESTIVAL_SPECTACLE', 'LIVESTREAM_EVENEMENT', 'LIVESTREAM_MUSIQUE', 'LIVESTREAM_PRATIQUE_ARTISTIQUE', 'RENCONTRE_EN_LIGNE', 'RENCONTRE_JEU', 'RENCONTRE', 'SALON', 'SEANCE_CINE', 'SEANCE_ESSAI_PRATIQUE_ART', 'SPECTACLE_REPRESENTATION', 'VISITE_GUIDEE', 'VISITE')"
        ],
      }),
    ).toEqual([{
      message: 'failed to create pass offer',
      fieldLabel: 'Pass Culture',
      code: 'registration.pass.invalidRelatedCategory',
      label: 'La sous-catégorie choisie n\'a pas été acceptée par le Pass Culture',
    }]);
  });

  test('unhandled Pass error', () => {
    expect(
      formatErrors({}),
    ).toEqual([{
      message: 'failed to create pass offer',
      fieldLabel: 'Pass Culture',
      code: 'registration.pass.genericError',
      label: 'Il y a eu un problème lors de la création de l\'offre Pass',
    }]);
  })
});
