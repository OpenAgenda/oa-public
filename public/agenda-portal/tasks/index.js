import cacheTask from './cache.js';

export default ({ config, app }) => {
  cacheTask(app, config.cache);
};
