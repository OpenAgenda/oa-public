const webpack = require( 'webpack' );

module.exports = function ( baseConfig, env, defaultConfig ) {
  defaultConfig.plugins.push(
    new webpack.DefinePlugin( {
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true
    } ),
  );

  defaultConfig.optimization.splitChunks.chunks = 'initial';

  return defaultConfig;
};
