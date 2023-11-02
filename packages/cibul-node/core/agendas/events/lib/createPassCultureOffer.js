'use strict';

const { produce } = require('immer');

module.exports = async function createPassCultureOffer(core, agenda, clean) {
  const {
    services: {
      registrations,
    }
  } = core;

  const {
    passCulture,
  } = clean;

  const passCultureService = registrations(agenda.settings.registration).passCulture;

  const {
    eventOffer,
    error,
  } = await passCultureService.createEventOffer(clean.event, passCulture);
  
  return produce(clean.event.registration, draft => {
    const item = draft.find(r => r.service === 'passCulture');
    
    item.data.id = eventOffer.id;
    item.value = passCultureService.getEventOfferLink(eventOffer);

    if (error) {
      item.data.error = error;
    }
  });
}
