module.exports = function removedParamHook() {
  return context => {
    context.params.query = context.params.query || {};

    if ( context.params.removed === true ) {
      context.params.query.isRemoved = 1;
    } else if ( context.params.removed === null ) {
      delete context.params.query.isRemoved;
    } else {
      context.params.query.isRemoved = 0;
    }

    return context;
  };
};
