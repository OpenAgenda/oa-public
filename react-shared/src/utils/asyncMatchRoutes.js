import { matchRoutes } from 'react-router-config';

function esModuleInterop(mod) {
  return mod && mod.__esModule ? mod.default : mod;
}

function getParams(match) {
  return match.reduce((result, route) => {
    if (route.match && route.match.params) {
      return { ...result, ...route.match.params };
    }
    return result;
  }, {});
}

const asyncMatchRoutes = (routes, pathname, { preloadPropName = 'load', skipPreload } = {}) => {
  const match = matchRoutes(routes, pathname.split('?')[0]);
  const params = getParams(match);
  let components = match.map(v => v.route.component);

  const skip = typeof skipPreload === 'function' && skipPreload({ components, match, params });

  if (skip) {
    return {
      components: [],
      match: [],
      params: {}
    };
  }

  if (!skip) {
    return Promise.all(
      components.reduce((accu, component) => {
        if (typeof component[preloadPropName] === 'function') {
          return accu.concat(Promise.resolve(component[preloadPropName]()).then(esModuleInterop));
        }

        return accu.concat(component);
      }, [])
    )
      .then(comps => ({ components: comps, match, params }));
  }
};

asyncMatchRoutes.matchRoutes = matchRoutes;
asyncMatchRoutes.getParams = getParams;

export default asyncMatchRoutes;
