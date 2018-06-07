module.exports = function isAction( action ) {
  return context => {
    return (context.params || {}).action === action
      || (context.params || {}).query && context.params.query.$client && context.params.query.$client.action === action;
  };
};
