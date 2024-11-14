import loadableModule from '@loadable/component';

const loadableComponent = loadableModule.default || loadableModule;

export default (params, options) => {
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
      return params.importSync;
    },
    resolve: params.resolve,
  };

  const Component = loadableComponent(loadableConstructor, options);

  Component.load = loadableConstructor.requireAsync.bind(loadableConstructor);

  Component.isReady = loadableConstructor.isReady
    ? loadableConstructor.isReady.bind(loadableConstructor)
    : () => false;

  return Component;
};
