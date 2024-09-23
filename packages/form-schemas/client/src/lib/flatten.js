const _ = require('lodash');
const ih = require('immutability-helper');

const defineFlatteningUpdate = (obj, lang) =>
  ['label', 'info', 'placeholder', 'sub', 'help'].reduce((update, f) => {
    if (!obj[f] || typeof obj[f] === 'string') {
      return update;
    }
    return {
      ...update,
      [f]: {
        $set: _.get(obj[f], lang, obj[f][Object.keys(obj[f]).shift()]),
      },
    };
  }, {});

module.exports = (field, lang) => {
  if (!field) return null;

  const { options } = field;

  const update = defineFlatteningUpdate(field, lang);

  if (options) {
    update.options = options.reduce(
      (optionsUpdate, o, i) => ({
        ...optionsUpdate,
        [i]: defineFlatteningUpdate(o, lang),
      }),
      {},
    );
  }

  return ih(field, update);
};
