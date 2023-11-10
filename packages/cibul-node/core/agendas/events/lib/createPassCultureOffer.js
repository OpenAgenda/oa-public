'use strict';

const { produce } = require('immer');

module.exports = async function createPassCultureOffer(core, agenda, clean) {
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

  return produce(clean.event.registration, draft => {
    const item = draft.find(r => r.service === 'passCulture');

    item.data.id = eventOffer.id;
    item.value = passCultureService.getEventOfferLink(eventOffer);

    if (errors) {
      item.data.errors = errors;
    }
  });
};
