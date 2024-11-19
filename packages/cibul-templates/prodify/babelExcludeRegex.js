'use strict';

const modulesToInclude = [
  '@feathersjs',
  `@openagenda`,
  '@uppy',
  'buffer',
  'debug',
  'intl-messageformat',
  'intl-messageformat-parser',
  'is-plain-obj',
  'ky',
  'lru-cache',
  'react-intl',
  'react-markdown',
  'yallist'
];

const BABEL_EXCLUDE_REGEX = new RegExp(`node_modules/(?!(${modulesToInclude.join('|')}))`);

module.exports = BABEL_EXCLUDE_REGEX;
