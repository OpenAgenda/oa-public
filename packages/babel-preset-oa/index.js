"use strict";

module.exports = {
  presets: [
    require( 'babel-preset-react' ),
    require( 'babel-preset-stage-0' ),
    [
      require( 'babel-preset-env' ),
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
  ],
  plugins: [
    require( 'babel-plugin-transform-runtime' ),
    require( 'babel-plugin-add-module-exports' ),
    require( 'babel-plugin-transform-decorators-legacy' ).default,
    require( 'babel-plugin-transform-class-properties' ),
    require( 'babel-plugin-transform-react-display-name' )
  ],
  env: {
    development: {
      plugins: [
        [
          require( 'babel-plugin-react-transform' ),
          {
            transforms: [
              {
                transform: 'react-transform-catch-errors',
                imports: [
                  'react',
                  'redbox-react'
                ]
              }
            ]
          }
        ]
      ]
    }
  }
};
