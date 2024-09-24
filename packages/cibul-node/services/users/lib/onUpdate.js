import resetCache from './resetCache.js';

export default function onUpdate(_config, services) {
  return async (context) => {
    await resetCache(services, context.result);
  };
}
