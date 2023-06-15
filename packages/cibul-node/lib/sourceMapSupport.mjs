import sourceMapSupport from 'source-map-support';

if (process.env.NODE_ENV === 'development') {
  sourceMapSupport.install({ hookRequire: true });
}
