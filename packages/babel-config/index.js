'use strict';

module.exports = api => {
  const presets = [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            '> 0.25%',
            'last 2 versions',
            'Firefox >= 24',
            'Chrome >= 33',
            'Safari >= 9',
            'IE >= 10'
          ],
          node: '8'
        }
      }
    ]
  ];

  const plugins = [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 2
      }
    ],
    '@babel/plugin-proposal-object-rest-spread',

    // Stage 0
    "@babel/plugin-proposal-function-bind",

    // Stage 1
    "@babel/plugin-proposal-export-default-from",

    // Stage 2
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    '@babel/plugin-proposal-export-namespace-from',

    // Stage 3
    '@babel/plugin-proposal-class-properties'
  ];

  if ( api.env( [ 'development', 'test' ] ) ) {
    plugins.push( '@babel/plugin-transform-react-jsx-source' );
  }

  if ( api.env( 'test' ) ) {
    plugins.push( 'babel-plugin-require-context-hook' );
  }

  return {
    presets,
    plugins,
    sourceMaps: api.env( [ 'development', 'test' ] ) ? 'both' : false
  };
};
