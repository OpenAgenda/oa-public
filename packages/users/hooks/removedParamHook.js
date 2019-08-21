'use strict';

module.exports = function removedParamHook() {
  return context => {
    context.params.query = context.params.query || {};

    if (context.params.removed === true) {
      context.params.query.isRemoved = 1;
      context.params.query.$disableSoftDelete = true;
    } else if (context.params.removed === null) {
      delete context.params.query.isRemoved;
      context.params.query.$disableSoftDelete = true;
    } else {
      context.params.query.isRemoved = 0;
    }

    return context;
  };
};
