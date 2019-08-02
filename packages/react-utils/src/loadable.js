import loadable from '@loadable/component';

// Wrapper with a working preload method
export default ( fn, options ) => {
  const Component = loadable( fn, options );

  Component.preload = fn.requireAsync || fn;

  Component.isReady = fn.isReady ? fn.isReady.bind( fn ) : (() => false);

  return Component;
};
