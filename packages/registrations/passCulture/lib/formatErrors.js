const isPriceCategoryKey = key => key.indexOf('priceCategories') === 0;
const isDateKey = key => key.indexOf('dates') === 0;

export default function formatErrors(error, options = {}) {
  const { log } = options;

  const formattedError = {
    message: 'failed to create pass offer',
    fieldLabel: 'Pass Culture',
  };

  const key = Object.keys(error).pop() ?? 'unhandled';
  const message = (error[key] ?? [])?.[0];

  if (key === 'venueId') {
    if (message === 'There is no venue with this id associated to your API key') {
      return [{
        ...formattedError,
        code: 'registration.pass.unknownVenueId',
        label: 'Le lieu choisi est inconnu du Pass Culture',
      }];
    }
  }
  if (key === 'categoryRelatedFields') {
    if (message.indexOf('No match for discriminator') !== -1) {
      return [{
        ...formattedError,
        code: 'registration.pass.invalidRelatedCategory',
        label: 'La sous-catégorie choisie n\'a pas été acceptée par le Pass Culture',
      }];
    }
  }

  if (isPriceCategoryKey(key) && message.indexOf('ensure this value has at least') !== -1) {
    return [{
      ...formattedError,
      message: 'failed to create price categories',
      code: 'registration.pass.invalidPriceCategory.label',
      label: 'Toutes les catégories de prix doivent avoir un label de défini',
    }];
  }

  if (isPriceCategoryKey(key)) {
    return [{
      ...formattedError,
      message: 'failed to create all price categories',
      code: 'registration.pass.invalidPriceCategory',
      label: 'Certaines catégories de prix n\'ont pas pu être créées',
    }];
  }

  if (isDateKey(key) && message.indexOf('Value must be positive') !== -1) {
    return [{
      ...formattedError,
      message: 'failed to create all dates',
      code: 'registration.pass.invalidDate.quantity',
      label: 'Certaines dates n\'ont pas pu être créées: les quantités saisies doivent être des entiers positifs',
    }];
  } if (isDateKey(key)) {
    return [{
      ...formattedError,
      message: 'failed to create all dates',
      code: 'registration.pass.invalidDate',
      label: 'Certaines dates n\'ont pas pu être créées',
    }];
  }

  if (log) {
    log.error('formatError', { error });
  }

  return [{
    ...formattedError,
    code: 'registration.pass.genericError',
    label: 'Il y a eu un problème lors de la création de l\'offre Pass',
  }];
}
