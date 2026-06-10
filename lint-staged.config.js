'use strict';

module.exports = {
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,mdx,css,html,yml,scss}': ['prettier --write'],
  // YAML kept in its own entry so the api-spec contract can be validated AFTER
  // formatting, in the same task (sequential) — never concurrently, which would
  // race prettier's write against validate's read of openapi.yaml.
  '*.yaml': (files) => {
    const commands = [`prettier --write ${files.join(' ')}`];
    if (files.some((f) => f.endsWith('public/api-spec/openapi.yaml'))) {
      commands.push('yarn workspace @openagenda/api-spec validate');
    }
    return commands;
  },
};
