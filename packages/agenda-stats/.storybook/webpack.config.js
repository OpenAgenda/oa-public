const oaModulesToBuild = [
  'activity-apps',
  'agenda-settings',
  'home',
  'user-apps',
];
const modulesToInclude = [
  '@feathersjs',
  `@openagenda/(?:${oaModulesToBuild.join('|')})`,
  'react-intl',
  'intl-messageformat',
  'intl-messageformat-parser',
];

const BABEL_EXCLUDE_REGEX = new RegExp(
  `node_modules/(?!(${modulesToInclude.join('|')}))`
);

module.exports = ({ config }) => {
  config.module.rules[0].include = undefined;
  config.module.rules[0].exclude = BABEL_EXCLUDE_REGEX;

  config.optimization.splitChunks.chunks = 'initial';

  return config;
};
