const { produce } = require('immer');

module.exports = function includePathInLocationImage({ assetsPath }, event) {
  if (!event.location?.image) {
    return event;
  }

  return produce(event, draft => {
    draft.location.image = `${assetsPath}${draft.location.image}`;
  });
}
