import loadable from '@loadable/component';

// Wrapper with a working load method
export default (fn, options) => {
  const Component = loadable(fn, options);

  Component.load = (fn.requireAsync || fn).bind(fn);

  Component.isReady = fn.isReady ? fn.isReady.bind(fn) : () => false;

  return Component;
};
