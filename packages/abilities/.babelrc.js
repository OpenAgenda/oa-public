'use strict';

module.exports = api => {
  const presets = [
    require( '@babel/preset-react' ),
    [
      require( '@babel/preset-env' ),
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
      require( '@babel/plugin-transform-runtime' ),
      {
        corejs: 2
      }
    ],
    [
      require( '@babel/plugin-proposal-decorators' ),
      {
        legacy: true
      }
    ],
    require( '@babel/plugin-proposal-class-properties' ),
    require( '@babel/plugin-proposal-object-rest-spread' )
  ];

  const config = {
    presets,
    plugins
  };

  if ( api.env( [ 'development', 'test' ] ) ) {
    config.sourceMaps = 'both';
  }

  if ( api.env( 'development' ) ) {
    plugins.push( require( '@babel/plugin-transform-react-jsx-source' ) );
  }

  return config;
};
