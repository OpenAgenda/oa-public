'use strict';

const log = require('@openagenda/logs')('core/agendas/events/createPassCultureOffer');

const { produce } = require('immer');

module.exports = async function createPassCultureOffer(core, agenda, clean) {
  log.info('called');

  const {
    services: {
      registrations,
    },
  } = core;

  const {
    passCulture,
  } = clean;

  const passCultureService = registrations(agenda.settings.registration).passCulture;

  const {
    eventOffer,
    errors,
  } = await passCultureService.createEventOffer(clean.event, passCulture);

  log.info('createEventOffer result', { eventOffer, errors });

  return produce(clean.event.registration, draft => {
    const item = draft.find(r => r.service === 'passCulture');

    item.data.id = eventOffer.id;
    item.value = passCultureService.getEventOfferLink(eventOffer);

    if (errors) {
      item.data.errors = errors;
    }
  });
};

module.exports.hasPassCultureOffer = function hasPassCultureOffer({ registration }) {
  if (!registration) {
    return false;
  }

  return registration.find(({ service, data }) => service === 'passCulture' && data.id);
};
