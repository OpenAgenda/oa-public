# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [2.1.1](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@2.1.0...@openagenda/agenda-locations@2.1.1) (2020-11-23)

**Note:** Version bump only for package @openagenda/agenda-locations





## [2.1.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.9...@openagenda/agenda-locations@2.1.0) (2020-11-23)


### Features

* update mapbox style ([e0f57a4](https://github.com/OpenAgenda/oa/commit/e0f57a4d200f7ee2e7fc22c192b2daad8446948b))
* **agenda-locations:** add capability to geocode locations at create or update ([7b39684](https://github.com/OpenAgenda/oa/commit/7b39684fb0c4a80efe9c3f719f0dc85e026a59df))
* **agenda-locations:** add includeFields option to list ([fa0aad6](https://github.com/OpenAgenda/oa/commit/fa0aad6616cafadb432c1a949d7cd06234865138))
* **agenda-locations:** added eventCounts option to new list ([8f78f31](https://github.com/OpenAgenda/oa/commit/8f78f314357ed7dd59e206276f5f3612651d48b2))
* **agenda-locations:** added field limitations ([18f3060](https://github.com/OpenAgenda/oa/commit/18f3060c6dd6e0a2bf23007b34307004aa0b093a))
* **agenda-locations:** added stream ([3c672a7](https://github.com/OpenAgenda/oa/commit/3c672a75a08a2b0d8aba44100b97667b151f3da6))
* **agenda-locations:** barebone list with 3 basic tests ([d832006](https://github.com/OpenAgenda/oa/commit/d832006329c23f7ab875f30c07f22cd1d11d0e5c))
* **agenda-locations:** BREAKING CHANGE: stream as list options rather than endpoint ([1977b5d](https://github.com/OpenAgenda/oa/commit/1977b5d08f5bb1df9ad8a7863a3558d107dc1d58))
* **agenda-locations:** detailed option for list ([6735a22](https://github.com/OpenAgenda/oa/commit/6735a220e7cfb4f03ed8ca88e577af56bf3d9e18))
* **agenda-locations:** filter out internal fields from create/update/patch results by default ([9c35071](https://github.com/OpenAgenda/oa/commit/9c35071ef4468903e449adfd248d4cebb9b1e02a))
* **agenda-locations:** get can take an extId ([caf3069](https://github.com/OpenAgenda/oa/commit/caf306968ab1c5947a72112781da780bf00ad19e))
* **agenda-locations:** getINSEECode refactor ([357f9c9](https://github.com/OpenAgenda/oa/commit/357f9c982ce4d7284a75ba94933f6bea5d3fccb0))
* **agenda-locations:** handle extId from store to dedicated field in patch & updates ([9cde71d](https://github.com/OpenAgenda/oa/commit/9cde71d3fc3e1eaadcb26c6df497dddbfca0f5b2))
* **agenda-locations:** interface change to fetch set_uid for location created via agendas endpoint ([bb2e676](https://github.com/OpenAgenda/oa/commit/bb2e6768a6054f1f1771cd4dd3bac148a38dbf77))
* **agenda-locations:** location sets ([015434e](https://github.com/OpenAgenda/oa/commit/015434e44c77bc5e4b23a0901bc7ba030fe0acbd))
* **agenda-locations:** LocationForm posts image with rest of data ([8fbfc24](https://github.com/OpenAgenda/oa/commit/8fbfc240a25d1f3ff8529b04cd9fc854463212b7))
* **agenda-locations:** make direct get available ([ea85107](https://github.com/OpenAgenda/oa/commit/ea85107a88509684ee816ff54069133b17f45252))
* **agenda-locations:** new get ([0213a6b](https://github.com/OpenAgenda/oa/commit/0213a6b6c80abe2e1f7cd55a1c2b307629545b70))
* **agenda-locations:** removal of legacy service ([5bccac8](https://github.com/OpenAgenda/oa/commit/5bccac8dab5451d12ba015a2f62184e0f9672561))
* **agenda-locations:** remove unused react-dropzone ([a9a86a4](https://github.com/OpenAgenda/oa/commit/a9a86a467aa9a0b758734026872564f9b311c4dd))
* **agenda-locations:** throw BadRequest error when identifiers are invalid ([1256f97](https://github.com/OpenAgenda/oa/commit/1256f97678abcac7b463ccab43fa751f99ee3f9e))
* replace extensions with mime types ([e768ba8](https://github.com/OpenAgenda/oa/commit/e768ba8f32baa862ecbf5e3cc88a8f253a546b15))
* update files to v3 ([706d94f](https://github.com/OpenAgenda/oa/commit/706d94fb26d6abef0080b910393257dd8ccae2a8))
* **agenda-locations:** search filter for list ([2eefdfc](https://github.com/OpenAgenda/oa/commit/2eefdfc4198b62e1385e709f9aff7cb273c895c4))
* **agenda-locations:** state & uids filters ([889e502](https://github.com/OpenAgenda/oa/commit/889e502b70f2734f0d694c00d75907bd712d5b86))
* **agenda-locations:** xlsx download button ([1157f14](https://github.com/OpenAgenda/oa/commit/1157f14c2c26c79b9fe4d483c82492a1cb646d17))


### Bug Fixes

* **agenda-locations:** auto geocode mode with latitude specified breaks update ([f3dfb0c](https://github.com/OpenAgenda/oa/commit/f3dfb0c291b8ff072bafb2da8805bba27dc34bdf))
* fix mapbox links ([01984da](https://github.com/OpenAgenda/oa/commit/01984da0c5794d99d0454dc19768603708096645))
* missing slashes ([2b9c1cd](https://github.com/OpenAgenda/oa/commit/2b9c1cd3be8eccba1419ba8968c5a5e1aa31f411))
* **agenda-locations:** add test for stream error ([cc142ad](https://github.com/OpenAgenda/oa/commit/cc142ad7f190c24953b19b36d27bc7731ec25fb2))
* **agenda-locations:** awaiting on knex causes query to db to be launched ([e1d9491](https://github.com/OpenAgenda/oa/commit/e1d94919ba8c6ee66eb0b070a6b135c9e164262d))
* **agenda-locations:** call willRemove interface before remove ([01c0881](https://github.com/OpenAgenda/oa/commit/01c088191ee0256398298e781320472f4fc47a55))
* **agenda-locations:** cancel button is broken ([89c99ad](https://github.com/OpenAgenda/oa/commit/89c99adbb3fd97c9614f7d3cfe0e6582b37c841f))
* **agenda-locations:** do not attempt geocode on empty addresses ([7d92891](https://github.com/OpenAgenda/oa/commit/7d92891d287575ed1b324622ddd5c2d40b45ecdf))
* **agenda-locations:** do not attempt insee fetch if geocode did not provide city & dept ([922cdde](https://github.com/OpenAgenda/oa/commit/922cdde5e53e2e41dcbc4da85e72cbe6d00c4b10))
* **agenda-locations:** files api changed a bit, breaking image upload result handling ([8490a30](https://github.com/OpenAgenda/oa/commit/8490a30f924696a843bba924345a9d36119d8ecd))
* **agenda-locations:** put merge action back on ([9ec025d](https://github.com/OpenAgenda/oa/commit/9ec025d7f555a6aa688be33df5f38805d79a7e77))
* **agenda-locations:** removed temporarily merge feature ([2bba1d5](https://github.com/OpenAgenda/oa/commit/2bba1d514587bdeda5a5e1a96048612a9967e7a9))
* **agenda-locations:** req.data takes req.body if no files, parsed req.body.data if files ([78ce289](https://github.com/OpenAgenda/oa/commit/78ce289de671ac314a3b9a80f2871a5f25b20979))
* **agenda-locations:** total option for new list throws exception ([b2dd039](https://github.com/OpenAgenda/oa/commit/b2dd03902cc852afcfe25eb970b63e54265c4e41))
* **agenda-locations:** uids filter is not known by legacy db.list ([93810e4](https://github.com/OpenAgenda/oa/commit/93810e41d445371cb43da407f51d95179d44511d))
* **agenda-locations:** update by marker move is broken ([b6dabd2](https://github.com/OpenAgenda/oa/commit/b6dabd215cffb78cc35b9fe3411bfc22a22f4ed6))



### [1.8.9](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.8...@openagenda/agenda-locations@1.8.9) (2020-07-16)

**Note:** Version bump only for package @openagenda/agenda-locations





### [1.8.8](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.7...@openagenda/agenda-locations@1.8.8) (2020-07-13)

**Note:** Version bump only for package @openagenda/agenda-locations





### [1.8.7](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.6...@openagenda/agenda-locations@1.8.7) (2020-07-10)


### Bug Fixes

* fix links in changelogs ([84e2460](https://github.com/OpenAgenda/oa/commit/84e24609981f4ee3bb9e34ef52109d74abe97a62))



### [1.8.6](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.5...@openagenda/agenda-locations@1.8.6) (2020-07-08)

**Note:** Version bump only for package @openagenda/agenda-locations





### [1.8.5](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.4...@openagenda/agenda-locations@1.8.5) (2020-07-06)

**Note:** Version bump only for package @openagenda/agenda-locations





### [1.8.4](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.3...@openagenda/agenda-locations@1.8.4) (2020-06-18)


### Bug Fixes

* **agenda-locations:** typoe ([d3506e7](https://github.com/OpenAgenda/oa/commit/d3506e7c84bb9edcd8f91628919b5cc31ba204b8))



### [1.8.3](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.2...@openagenda/agenda-locations@1.8.3) (2020-06-09)

**Note:** Version bump only for package @openagenda/agenda-locations





### [1.8.2](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.1...@openagenda/agenda-locations@1.8.2) (2020-05-22)

**Note:** Version bump only for package @openagenda/agenda-locations





### [1.8.1](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.8.0...@openagenda/agenda-locations@1.8.1) (2020-05-19)

**Note:** Version bump only for package @openagenda/agenda-locations





## [1.8.0](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.7.4...@openagenda/agenda-locations@1.8.0) (2020-05-15)


### Features

* **agenda-locations:** upgrade storybook config ([9b4d834](https://github.com/OpenAgenda/oa/commit/9b4d8345d9370e64cdcd0e600559fac9ac151015))


### Bug Fixes

* **agenda-locations:** "fix" the storybook ([1785df8](https://github.com/OpenAgenda/oa/commit/1785df8fa076a5858d1e5a090d09f70852d0e404))



### [1.7.4](https://github.com/OpenAgenda/oa/compare/@openagenda/agenda-locations@1.7.3...@openagenda/agenda-locations@1.7.4) (2020-04-07)

**Note:** Version bump only for package @openagenda/agenda-locations





## <small>1.7.3 (2020-04-03)</small>

**Note:** Version bump only for package @openagenda/agenda-locations





## <small>1.7.2 (2020-04-03)</small>

**Note:** Version bump only for package @openagenda/agenda-locations





## <small>1.7.1 (2020-04-03)</small>

* agenda-locations: remove usuned s3 dependency ([14058aa](https://github.com/OpenAgenda/oa/commit/14058aa))
* agenda-locations: use knex pool ([b02e064](https://github.com/OpenAgenda/oa/commit/b02e064))
* agenda-locations: use knex pool ([1ceb20f](https://github.com/OpenAgenda/oa/commit/1ceb20f))
* fix builds on Yarn 2 ([f4723be](https://github.com/OpenAgenda/oa/commit/f4723be))
* fix decorators, eslint and HMR ([3eb9b89](https://github.com/OpenAgenda/oa/commit/3eb9b89))
* fix deps ([71703f8](https://github.com/OpenAgenda/oa/commit/71703f8))
* Merge branch 'aggregator-sources' ([74be703](https://github.com/OpenAgenda/oa/commit/74be703))
* Merge branch 'master' of bitbucket.org:openagenda/oa into aggregator-sources ([a89accd](https://github.com/OpenAgenda/oa/commit/a89accd))
* Merge branch 'master' of bitbucket.org:openagenda/oa into aggregator-sources ([5090a3c](https://github.com/OpenAgenda/oa/commit/5090a3c))
* Merge branch 'master' of bitbucket.org:openagenda/oa into aggregator-sources ([54fb7c3](https://github.com/OpenAgenda/oa/commit/54fb7c3))
* merge resolution ([0c50be3](https://github.com/OpenAgenda/oa/commit/0c50be3))
* upgrade babel ([444b969](https://github.com/OpenAgenda/oa/commit/444b969))
* upgrade deps ([925ed0f](https://github.com/OpenAgenda/oa/commit/925ed0f))
* upgrade jest and core-js ([21c2768](https://github.com/OpenAgenda/oa/commit/21c2768))
* upgrade some deps ([33a049a](https://github.com/OpenAgenda/oa/commit/33a049a))
* upgrade some deps and remove unused deps ([0c212fb](https://github.com/OpenAgenda/oa/commit/0c212fb))
* use the same lodash ([aeae186](https://github.com/OpenAgenda/oa/commit/aeae186))
* tweaks(agenda-location): more stories for each component ([a7df935](https://github.com/OpenAgenda/oa/commit/a7df935))
* tweaks(agenda-locations): presentation tweaks ([ae6906d](https://github.com/OpenAgenda/oa/commit/ae6906d))
* fix(agenda-locations): list crashes when empty list of uids is provided as query ([8b774cc](https://github.com/OpenAgenda/oa/commit/8b774cc))
* fix(agenda-locations): update does not accept empty array ([23e8d23](https://github.com/OpenAgenda/oa/commit/23e8d23))
* tweak(agenda-locations): added credits to map ([dd909eb](https://github.com/OpenAgenda/oa/commit/dd909eb))
* tweak(agenda-locations): refresh component code ([5fb186d](https://github.com/OpenAgenda/oa/commit/5fb186d))
* feature(agenda-locations): confirm dialog on location selector in event form ([0f0eff9](https://github.com/OpenAgenda/oa/commit/0f0eff9))
