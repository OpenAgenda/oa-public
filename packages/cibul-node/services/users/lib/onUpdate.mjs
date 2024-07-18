import resetCache from './resetCache.mjs';

export default function onUpdate(_config, services) {
  return async context => {
    await resetCache(services, context.result);
  };
};
