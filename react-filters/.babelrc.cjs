'use strict';

// Used for webpack build

module.exports = {
  presets: [
    [
      require.resolve('@openagenda/babel-preset'),
      {
        reactIntl: {
          idInterpolationPattern: '[sha512:contenthash:base64:6]',
          extractFromFormatMessageCall: true,
          ast: true,
        },
        importSource: '@emotion/react',
      },
    ],
  ],
  plugins: [require.resolve('@emotion/babel-plugin')],
  sourceType: 'unambiguous',
};
