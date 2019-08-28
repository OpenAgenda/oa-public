const webpack = require( 'webpack' );

module.exports = ({ config }) => {
  config.plugins.push(
    new webpack.DefinePlugin( {
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true
    } ),
  );

  return config;
};
