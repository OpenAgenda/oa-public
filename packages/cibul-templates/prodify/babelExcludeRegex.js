'use strict';

const oaModulesToBuild = [
  'activity-apps',
  'agenda-settings',
  'home',
  'user-apps'
];
const modulesToInclude = [
  '@feathersjs',
  `@openagenda/(?:${oaModulesToBuild.join('|')})`,
  'debug',
  'intl-messageformat',
  'intl-messageformat-parser',
  'lru-cache',
  'react-intl',
  'yallist'
];

const BABEL_EXCLUDE_REGEX = new RegExp(`node_modules/(?!(${modulesToInclude.join('|')}))`);

module.exports = BABEL_EXCLUDE_REGEX;
