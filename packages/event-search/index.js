import _ from 'lodash';
import elasticsearch from '@elastic/elasticsearch';
import logger from '@openagenda/logs';
import add from './add.js';
import Search from './search.js';
import moreLikeThis from './moreLikeThis.js';
import rebuild from './rebuild.js';
import remove from './remove.js';
import clear from './clear.js';
import searchIncludes from './config/searchIncludes.json' with { type: 'json' };
import update from './update.js';
import Cluster from './cluster/index.js';
import mapping from './config/mapping.json' with { type: 'json' };
import updateMapping from './utils/updateMapping.js';
import updateDynamicSettings from './utils/updateDynamicSettings.js';
import geoJSON from './utils/geoJSON.js';

export default (c) => {
  // Elbow sensitivity for `threshold=auto` (see computeRelevanceCutoff). The
  // service's default lives here, at the options destructuring; the caller
  // (e.g. cibul-node, from an env var) may override it.
  const { relevanceMinDrop = 0.3, ...rest } = c;

  const config = {
    client: new elasticsearch.Client(
      _.pick(c.elasticsearch, ['node', 'log', 'ssl']),
    ),
    type: 'event',
    baseSearchIncludes: searchIncludes.base,
    detailedSearchIncludes: searchIncludes.detailed,
    otherStandardFields: searchIncludes.other,
    defaultIndex: 'main',
    assetsPath: null,
    ...rest,
    relevanceMinDrop,
  };

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return Object.assign(
    (alias) => {
      const search = Search(config, alias);

      return {
        name: alias,
        rebuild: rebuild.bind(null, config, alias),
        search,
        moreLikeThis: moreLikeThis.bind(null, search),
        add: add.bind(null, config, alias),
        update: update.bind(null, config, alias),
        remove: remove.bind(null, config, alias),
        clear: clear.bind(null, config, alias),
      };
    },
    {
      getConfig: () => config,
      cluster: Cluster(config),
      updateMapping: updateMapping.bind(
        null,
        config,
        config.defaultIndex,
        mapping,
      ),
      updateDynamicSettings: updateDynamicSettings.bind(
        null,
        config,
        config.defaultIndex,
        config.dynamicSettings,
      ),
    },
  );
};

export const utils = {
  geoJSON,
};
