// Native-ESM jest (run with NODE_OPTIONS=--experimental-vm-modules, see the
// `test` script). `transform: {}` disables Babel — the package is real ESM and
// jest's vm-modules support runs it as-is. Unit tests only: no network, no
// sandbox binary (deno/srt), no live API — the executor is mocked.
export default {
  testMatch: ['**/test/**/*.test.{js,mjs}'],
  transform: {},
  testTimeout: 10000,
};
