import logs from '@openagenda/logs';

const log = logs('formatErrors');

export default function formatErrors(error) {
  const formattedError = {
    message: 'failed to create pass offer',
    fieldLabel: 'Pass Culture',
  };

  const key = Object.keys(error).pop();

  if (key === 'venueId') {
    if (error.venueId.pop() === 'There is no venue with this id associated to your API key') {
      return [{
        ...formattedError,
        code: 'registration.pass.unknownVenueId',
        label: 'Le lieu choisi est inconnu du Pass Culture',
      }];
    }
  }
  if (key === 'categoryRelatedFields') {
    if (error[key].pop().indexOf('No match for discriminator') !== -1) {
      return [{
        ...formattedError,
        code: 'registration.pass.invalidRelatedCategory',
        label: 'La sous-catégorie choisie n\'a pas été acceptée par le Pass Culture',
      }];
    }
  }

  log.info(error);

  return [{
    ...formattedError,
    code: 'registration.pass.genericError',
    label: 'Il y a eu un problème lors de la création de l\'offre Pass',
  }];
}