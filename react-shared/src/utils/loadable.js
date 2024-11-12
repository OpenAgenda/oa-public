import loadable from '@loadable/component';
import esm from '@httptoolkit/esm';

const requireEsm = typeof esm === 'function' ? esm(module) : () => null;

// Wrapper with a working load method
export default (fn, options) => {
  const Component = loadable(fn, options);

  Component.load = (fn.requireAsync || fn).bind(fn);

  Component.isReady = fn.isReady ? fn.isReady.bind(fn) : () => false;

  return Component;
};

export const lib = (fn, options) => {
  const Component = loadable.lib(fn, options);

  Component.load = (fn.requireAsync || fn).bind(fn);

  Component.isReady = fn.isReady ? fn.isReady.bind(fn) : () => false;

  return Component;
};

export const loadableComponent = (params, options) => {
  const loadableConstructor = {
    resolved: {},
    chunkName() {
      return params.chunkName;
    },
    isReady(props) {
      const key = this.resolve(props);
      if (this.resolved[key] !== true) {
        return false;
      }
      // eslint-disable-next-line camelcase
      if (typeof __webpack_modules__ !== 'undefined') {
        // eslint-disable-next-line camelcase,no-undef
        return !!__webpack_modules__[key];
      }
      return false;
    },
    importAsync: params.importAsync,
    requireAsync(props) {
      const key = this.resolve(props);
      this.resolved[key] = false;
      return this.importAsync(props).then((resolved) => {
        this.resolved[key] = true;
        return resolved;
      });
    },
    requireSync(props) {
      const id = this.resolve(props);
      // eslint-disable-next-line camelcase
      if (typeof __webpack_require__ !== 'undefined') {
        // eslint-disable-next-line no-undef
        return __webpack_require__(id);
      }
      return requireEsm(id);
    },
    resolve: params.resolve,
  };

  const Component = loadable(loadableConstructor, options);

  Component.load = loadableConstructor.requireAsync.bind(loadableConstructor);

  Component.isReady = loadableConstructor.isReady
    ? loadableConstructor.isReady.bind(loadableConstructor)
    : () => false;

  return Component;
};
