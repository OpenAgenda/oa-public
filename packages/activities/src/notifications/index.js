import addActivity from './addActivity.js';
import count from './count.js';
import get from './get.js';
import list from './list.js';
import markAs from './markAs.js';
import markAll from './markAll.js';
import remove from './remove.js';
import enqueueSummaries from './enqueueSummaries.js';
import prepareSummary from './prepareSummary.js';

export default function notifications(config, identifiers) {
  return {
    addActivity: addActivity.bind(null, config, identifiers),
    count: count.bind(null, config, identifiers),
    get: get.bind(null, config, identifiers),
    list: list.bind(null, config, identifiers),
    markAs: markAs.bind(null, config, identifiers),
    markAll: markAll.bind(null, config, identifiers),
    remove: remove.bind(null, config, identifiers),
    enqueueSummaries: enqueueSummaries.bind(null, config),
    prepareSummary: prepareSummary.bind(null, config),
  };
}
