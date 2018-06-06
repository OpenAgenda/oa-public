module.exports = function isAction( action ) {
  return context => (context.params || {}).action === action;
};
