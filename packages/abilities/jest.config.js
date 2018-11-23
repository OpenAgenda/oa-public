'use strict';

const path = require( 'path' );

module.exports = {
  testEnvironment: 'node',
  setupTestFrameworkScriptFile: '<rootDir>/test/setup.js',
  modulePaths: [
    path.join( __dirname, 'node_modules' ),
    path.join( __dirname, '..', '..', 'node_modules' )
  ]
};
