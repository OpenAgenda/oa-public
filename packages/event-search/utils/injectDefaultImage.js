'use strict';

const { produce } = require('immer');

module.exports = function injectDefaultImage({ defaultImage }, event) {
  if (event?.image?.filename) {
    return event;
  }

  return produce(event, draft => {
    draft.image = defaultImage;
  })
}
