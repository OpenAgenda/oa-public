const addActivity = require('./addActivity');
const count = require('./count');
const get = require('./get');
const list = require('./list');
const markAs = require('./markAs');
const remove = require('./remove');
const enqueueSummaries = require('./enqueueSummaries');
const prepareSummary = require('./prepareSummary');

module.exports = function notifications(config, identifiers) {
  return {
    addActivity: addActivity.bind(null, config, identifiers),
    count: count.bind(null, config, identifiers),
    get: get.bind(null, config, identifiers),
    list: list.bind(null, config, identifiers),
    markAs: markAs.bind(null, config, identifiers),
    remove: remove.bind(null, config, identifiers),
    enqueueSummaries: enqueueSummaries.bind(null, config),
    prepareSummary: prepareSummary.bind(null, config),
  };
};
