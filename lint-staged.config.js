'use strict';

module.exports = {
  '*.{js,jsx,mjs,ts,tsx,mts}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': ['prettier --write'],
};
