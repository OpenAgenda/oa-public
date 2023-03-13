const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env = {}, argv = {}) => {
  const defaultEnvName = env.production || argv.mode === 'production' ? 'production' : 'development';
  const envName = process.env.NODE_ENV || env.NODE_ENV || defaultEnvName;
  const babelEnvName = process.env.BABEL_ENV || env.BABEL_ENV || envName;

  return {
    mode: envName === 'production' ? 'production' : 'development',
    entry: {
      main: [
        './src/index.js',
        './src/style.scss',
      ],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            envName: babelEnvName,
            rootMode: 'upward',
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            envName !== 'production'
              ? 'style-loader'
              : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: '[name].css' }),
      new CleanWebpackPlugin(),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              ie8: true,
            },
          },
        }),
      ],
    },
  };
};
