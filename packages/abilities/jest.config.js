'use strict';

const path = require('path');

module.exports = {
  testEnvironment: 'node',
  modulePaths: [
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, '..', '..', 'node_modules')
  ]
};
