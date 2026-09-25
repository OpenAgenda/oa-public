# Change Log

## 2.1.1

### Patch Changes

- [#477](https://github.com/OpenAgenda/oa/pull/477) [`b823501`](https://github.com/OpenAgenda/oa/commit/b823501aa720ffc4b3245722336b0383152b6910) Thanks [@kaore](https://github.com/kaore)! - Name the country `FR` "France", no longer "France (Métropole)".

  The ISO code covers the whole French Republic, overseas departments included, so a location in La Réunion or Guadeloupe was exported under a label that denied where it was. `RE` also reads "La Réunion" in French and "Réunion" in English.

## 2.1.0

### Minor Changes

- [#276](https://github.com/OpenAgenda/oa/pull/276) [`0eef788`](https://github.com/OpenAgenda/oa/commit/0eef78859859f816f27c4c1ba5ceed35dcd93fc1) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Require React 19.2.8, up from 19.2.2 (19.1.0 for `@openagenda/widgets`).

  React 19.2.3 through 19.2.8 are all React Server Components hardening: DoS mitigations for Server Actions, cycle protections, type hardening and a fix for `FormData` entries dropped from Server Actions. Nothing in these packages' own code changes.

  The bump is `minor` wherever a `dependencies` or `peerDependencies` floor moves, since it narrows what consumers may install; `patch` where only `devDependencies` are involved. Consumers already on React 19.2.8 or later are unaffected.

### Patch Changes

- [#282](https://github.com/OpenAgenda/oa/pull/282) [`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Jest from 29.7 to 30.4.2, along with `babel-jest`, `@jest/globals` and `jest-environment-jsdom` (30.4.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  Jest 30 supports `import.meta.filename` and `import.meta.dirname` natively, so the local patch these packages relied on (`jest-runtime@29.7.0`) is removed along with its `resolutions` entry.

- [#281](https://github.com/OpenAgenda/oa/pull/281) [`b32510d`](https://github.com/OpenAgenda/oa/commit/b32510d2625563744bdfbf88946f07674de158c7) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Move Storybook from 10.2 to 10.5.7, along with `@storybook/react-webpack5`, `@storybook/html-vite` and `@storybook/addon-webpack5-compiler-babel` (4.0.0 to 4.0.1). Development tooling only — no runtime or API change, and nothing in the published output differs.

  All of these were already on `^10.2.0` carets that permitted 10.5.7, so the resolved version was the only thing lagging; the declarations now state what is installed.

- Updated dependencies [[`e0d6bfc`](https://github.com/OpenAgenda/oa/commit/e0d6bfcfb51628d469e5cc2936d2fa8de75645e5), [`adf3653`](https://github.com/OpenAgenda/oa/commit/adf36534bde6e3590951e0b27649fb04e5c27e61)]:
  - @openagenda/logs@1.2.2

## 2.0.2

### Patch Changes

- [#226](https://github.com/OpenAgenda/oa/pull/226) [`6554727`](https://github.com/OpenAgenda/oa/commit/6554727ba5f4aa47751a382490131477c3afc7e3) Thanks [@kaore](https://github.com/kaore)! - Bump `express` to `^4.21.2` (and `body-parser` to `^1.20.3` where declared) to
  remediate the `body-parser` url-encoded request DoS and the `path-to-regexp`
  route-matching ReDoS carried by express 4.18.x. First-party dependency bumps,
  no `resolutions` overrides.

## 2.0.1

### Patch Changes

- Updated dependencies [[`a3bd9bd`](https://github.com/OpenAgenda/oa/commit/a3bd9bd75ac41e5f5c62bc7e43efcd8b376ffa99)]:
  - @openagenda/logs@1.2.1

## 2.0.0

### Major Changes

- [`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Replace the redis-backed queue integration with a callback API: the `queue` option is gone, pass `onProcessGenerateRequest` instead and call the returned `processGenerateRequest` yourself.

  - HTTP requests switch from `superagent` to native `fetch` (with `qs` for query strings).
  - Generated documents are now named `slug.randomHex.docx` instead of `title.docx`, and the export modal link carries a `download` attribute.
  - `@openagenda/verror` ^3.2.0, Storybook 10, redis dropped from the dev setup.

### Patch Changes

- Updated dependencies [[`0e637d9`](https://github.com/OpenAgenda/oa/commit/0e637d97919b2e83de5a7d9e3216bf3fd8dcf2f9)]:
  - @openagenda/logs@1.2.0

## 1.2.2

### Patch Changes

- Updated dependencies [[`9130206`](https://github.com/OpenAgenda/oa/commit/9130206f01c7b004965a026e357974f68c5d4dc9)]:
  - @openagenda/logs@1.1.10

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.14...@openagenda/agenda-docx@1.2.0) (2020-11-23)

### Features

- update moment and moment-timezone ([99dc602](https://github.com/OpenAgenda/oa/commit/99dc602a8f374a3a2d40c2c7d47908b602dfd878))

### Bug Fixes

- **agenda-docx:** handicap ii is unknown by format ([ee19018](https://github.com/OpenAgenda/oa/commit/ee19018d26e7e0bd009ff63a240b93ff6e961769))

### [1.1.14](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.13...@openagenda/agenda-docx@1.1.14) (2020-07-16)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.13](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.12...@openagenda/agenda-docx@1.1.13) (2020-07-13)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.12](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.11...@openagenda/agenda-docx@1.1.12) (2020-07-10)

### Bug Fixes

- fix links in changelogs ([84e2460](https://github.com/OpenAgenda/oa/commit/84e24609981f4ee3bb9e34ef52109d74abe97a62))

### [1.1.11](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.10...@openagenda/agenda-docx@1.1.11) (2020-07-08)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.10](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.9...@openagenda/agenda-docx@1.1.10) (2020-07-06)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.9](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.8...@openagenda/agenda-docx@1.1.9) (2020-06-18)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.8](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.7...@openagenda/agenda-docx@1.1.8) (2020-06-09)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.7](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.6...@openagenda/agenda-docx@1.1.7) (2020-05-22)

**Note:** Version bump only for package @openagenda/agenda-docx

### [1.1.6](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.5...@openagenda/agenda-docx@1.1.6) (2020-05-15)

### Bug Fixes

- does not use global moment locale ([95101c3](https://github.com/OpenAgenda/oa/commit/95101c3bade5aa224003d3ec716571548aeb0d97))

### [1.1.5](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-docx@1.1.4...@openagenda/agenda-docx@1.1.5) (2020-04-07)

**Note:** Version bump only for package @openagenda/agenda-docx

## <small>1.1.4 (2020-04-03)</small>

- add react-integration-app package ([bab0d17](https://github.com/OpenAgenda/oa/commit/bab0d17))
- agenda-docx: remove the limit of 1000 events ([068c67c](https://github.com/OpenAgenda/oa/commit/068c67c))
- agenda-docx: update linter ([b0f1b80](https://github.com/OpenAgenda/oa/commit/b0f1b80))
- fix builds on Yarn 2 ([f4723be](https://github.com/OpenAgenda/oa/commit/f4723be))
- fix decorators, eslint and HMR ([3eb9b89](https://github.com/OpenAgenda/oa/commit/3eb9b89))
- fix dependencies ([1b2467e](https://github.com/OpenAgenda/oa/commit/1b2467e))
- fix deps ([71703f8](https://github.com/OpenAgenda/oa/commit/71703f8))
- fix linting ([90ad3dc](https://github.com/OpenAgenda/oa/commit/90ad3dc))
- fix package.json files ([28b1751](https://github.com/OpenAgenda/oa/commit/28b1751))
- fix polyfills ([2c456e1](https://github.com/OpenAgenda/oa/commit/2c456e1))
- fix webpack-dev-server ([d874a0b](https://github.com/OpenAgenda/oa/commit/d874a0b))
- functional webapp ([793ca92](https://github.com/OpenAgenda/oa/commit/793ca92))
- lint ([940c95d](https://github.com/OpenAgenda/oa/commit/940c95d))
- lint and prettier ([b1dbbc0](https://github.com/OpenAgenda/oa/commit/b1dbbc0))
- linting ([8df038c](https://github.com/OpenAgenda/oa/commit/8df038c))
- Merge branch 'master' into webapp ([dc1e964](https://github.com/OpenAgenda/oa/commit/dc1e964))
- Merge branch 'master' into webapp ([e94b577](https://github.com/OpenAgenda/oa/commit/e94b577))
- Merge branch 'master' of bitbucket.org:openagenda/oa into webapp ([033351b](https://github.com/OpenAgenda/oa/commit/033351b))
- Merge branch 'master' of bitbucket.org:openagenda/oa into webapp ([356677c](https://github.com/OpenAgenda/oa/commit/356677c))
- remove deprecated @babel/polyfill and upgrade to core-js@3 ([e006882](https://github.com/OpenAgenda/oa/commit/e006882))
- remove useless babel-core@bridge ([f2d2d91](https://github.com/OpenAgenda/oa/commit/f2d2d91))
- rename babel-preset-openagenda to @openagenda/babel-preset ([1da3284](https://github.com/OpenAgenda/oa/commit/1da3284))
- update Jest multi projects config ([41ced2a](https://github.com/OpenAgenda/oa/commit/41ced2a))
- upgrade babel ([444b969](https://github.com/OpenAgenda/oa/commit/444b969))
- upgrade babel dependencies ([97b3057](https://github.com/OpenAgenda/oa/commit/97b3057))
- upgrade deps ([925ed0f](https://github.com/OpenAgenda/oa/commit/925ed0f))
- upgrade eslint ([e76d140](https://github.com/OpenAgenda/oa/commit/e76d140))
- upgrade jest and core-js ([21c2768](https://github.com/OpenAgenda/oa/commit/21c2768))
- upgrade react ([0c64635](https://github.com/OpenAgenda/oa/commit/0c64635))
- upgrade react ([9096056](https://github.com/OpenAgenda/oa/commit/9096056))
- upgrade react-router deps ([94402fd](https://github.com/OpenAgenda/oa/commit/94402fd))
- upgrade some deps ([33a049a](https://github.com/OpenAgenda/oa/commit/33a049a))
- upgrade some deps ([dd48588](https://github.com/OpenAgenda/oa/commit/dd48588))
- upgrade some deps ([1d10a03](https://github.com/OpenAgenda/oa/commit/1d10a03))
- upgrade some deps ([998baed](https://github.com/OpenAgenda/oa/commit/998baed))
- upgrade some deps and remove unused deps ([0c212fb](https://github.com/OpenAgenda/oa/commit/0c212fb))
- use the same lodash ([aeae186](https://github.com/OpenAgenda/oa/commit/aeae186))
