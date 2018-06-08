module.exports = function isAction( action ) {
  return context => {
    if ( (context.params || {}).query && context.params.query.$client && context.params.query.$client.action ) {
      return context.params.query.$client.action === action;
    }

    return (context.params || {}).action === action;
  };
};
