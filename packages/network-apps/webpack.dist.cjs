'use strict';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const bucket = process.env.S3_ASSETS_BUCKET;
const serviceName = require('./package.json').name.split('/').pop();

const pushToCDN = process.env.NODE_ENV === 'production' && parseInt(process.env.CDN, 10);

const localDistPath = `${__dirname}/client/dist`;

module.exports = {
  // better to have a dist file in dev mode for local troubleshooting
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: __dirname,
  // defaults at true
  optimization: { minimize: true },
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './client/src/index.js',
  ],
  output: {
    path: localDistPath,
    filename: '[name]-[contenthash].js',
    chunkFilename: '[id]-[chunkhash].js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackAssetsManifest({
      output: `${__dirname}/client/dist/manifest.json`,
    }),
  ].concat(
    pushToCDN
      ? [
        // new CompressionPlugin({
        //   test: /\.js$/,
        //   filename(asset) {
        //     return asset.file.replace('.gz', '');
        //   },
        // }),
        new S3Plugin({
          include: /\.js$/,
          s3Options: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            s3ForcePathStyle: true,
          },
          s3UploadOptions: {
            Bucket: bucket,
            ContentType(fileName) {
              if (/\.css$/.test(fileName)) {
                return 'text/css';
              }
              if (/\.js$/.test(fileName)) {
                return 'text/javascript';
              }
            },
          },
          basePathTransform: (f) => ['svc', serviceName, f].join('/'),
        }),
      ]
      : [],
  ),
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
          fullySpecified: false,
        },
        exclude: [
          /\/node_modules\/nth-check\//,
          /\/node_modules\/@formatjs\//,
          /\/node_modules\/intl-messageformat\//,
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
        },
      },
      {
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
      },
      {
        test: /\.scss$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          require.resolve('sass-loader'),
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.wasm'],
  },
};
