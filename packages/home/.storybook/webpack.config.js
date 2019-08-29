const webpack = require( 'webpack' );

module.exports = function ( { config } ) {
  config.plugins.push(
    new webpack.DefinePlugin( {
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true
    } ),
  );

  return config;
};
