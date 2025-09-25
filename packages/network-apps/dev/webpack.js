import webpack from 'webpack';

export default {
  mode: 'development',
  context: import.meta.dirname,
  entry: ['webpack-hot-middleware/client', '../client/src/index.js'],
  output: {
    publicPath: '/js/',
    filename: 'app.js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        resolve: {
          fullySpecified: false,
        },
        exclude: [/\/node_modules\/nth-check\//],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.wasm'],
  },
};
