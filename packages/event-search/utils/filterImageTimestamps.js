'use strict';

const { produce } = require('immer');

module.exports = function filterImageTimestamps(event) {  
  if (!event?.image?.filename) {
    return event;
  }

  return produce(event, draft => {
    if (draft.image.filename.indexOf('?') !== -1) {
      draft.image.filename = draft.image.filename.split('?').shift();
    }

    if (!draft.image.variants) {
      return draft;
    }
  
    for (const variant of draft.image.variants) {
      if (variant.filename.indexOf('?') !== -1) {
        variant.filename = variant.filename.split('?').shift();
      }
    }
  
    return draft;
  });
}