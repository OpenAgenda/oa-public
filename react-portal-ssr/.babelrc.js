'use strict';

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
      },
    ],
  ],
  sourceType: 'unambiguous',
};
