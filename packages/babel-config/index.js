'use strict';

module.exports = api => {
  api.cache.using( () => process.env.NODE_ENV );

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
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from'
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
    sourceMaps: api.env( [ 'development', 'test' ] )
  };
};
