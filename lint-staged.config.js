module.exports = {
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': ['prettier --write', 'eslint --fix'],
  '*.{json,md,mdx,css,html,yml,yaml,scss}': ['prettier --write'],
};
