# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.8.0](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.8.0..@openagenda/event-search@2.7.4) (2020-11-23)


### Features

* **event-search:** add fixedInterval option for timestamp aggregation ([2f55dbc](https://bitbucket.org/openagenda/oa/commits/2f55dbce4f66e848061026c1e29d7c297678c742))
* **event-search:** added additionalFieldMetrics aggregation ([475f340](https://bitbucket.org/openagenda/oa/commits/475f3402e20939836b7e63cc5d6196837675ba05))
* **event-search:** additional number fieldName should be keyword ([c85a1e1](https://bitbucket.org/openagenda/oa/commits/c85a1e105f8ddd50fb81e22deeaa352d46284aac))
* **event-search:** aggregation by createdOrUpdatedAt timestamp ([64b5751](https://bitbucket.org/openagenda/oa/commits/64b57519ecf0ced8187c73103aff81267dbeabb7))
* **event-search:** attempt convert query state to integers when strings are provided ([62259fa](https://bitbucket.org/openagenda/oa/commits/62259fa382223ac9477e21b4bc7205f622289371))
* **event-search:** ensure events of same agenda are always on the same shard/replicas ([d8fa1e4](https://bitbucket.org/openagenda/oa/commits/d8fa1e4dc034fc28ec20ec4c74f3d0d597381427))
* **event-search:** fix states order ([989db24](https://bitbucket.org/openagenda/oa/commits/989db24459f1b2ab48e2241e724f1c7823be3b0a))
* **event-search:** multiple filter selections within same field work as logical or ([224b1e8](https://bitbucket.org/openagenda/oa/commits/224b1e8045fa776ec2b8b027098743f8eee92dd1))
* **event-search:** search_after added ([f85810f](https://bitbucket.org/openagenda/oa/commits/f85810f2d8802e0b9485f7696bb30ccdad9bdf50))
* **event-search:** utility to add new fields to main index mapping when they are set in mapping.json ([bb3fad2](https://bitbucket.org/openagenda/oa/commits/bb3fad234468986a6d6c85384e91f53e5eb67e0c))
* update moment and moment-timezone ([99dc602](https://bitbucket.org/openagenda/oa/commits/99dc602a8f374a3a2d40c2c7d47908b602dfd878))


### Bug Fixes

* **event-search:** allow extendedBounds for timestamp aggregations ([fe02493](https://bitbucket.org/openagenda/oa/commits/fe02493a1f1981b42e0021d6cdc95f292114fa49))
* **event-search:** fix updatedAt filter ([ca842b1](https://bitbucket.org/openagenda/oa/commits/ca842b160dbe52b58c82868fca0ed9db587ba4f4))
* **event-search:** force timezone to Paris even when is null ([eae1f31](https://bitbucket.org/openagenda/oa/commits/eae1f31796272666185c044b81c7787bee769b76))
* **event-search:** formatEvent test _search_additional_numbers field key should be fieldName ([a2ddf18](https://bitbucket.org/openagenda/oa/commits/a2ddf18057b8873fc345e6e585c9651465c78830))
* **event-search:** origin agenda aggregations with titles including ':' chars are broken ([69000b1](https://bitbucket.org/openagenda/oa/commits/69000b1c52bd236bc27b5505b84158707059263e))
* **event-search:** routing is necessary for remove ([06ff037](https://bitbucket.org/openagenda/oa/commits/06ff037840c2624bd029ffe5d079e693260a8eda))
* **event-search:** sort test quick fix ([1ed6c96](https://bitbucket.org/openagenda/oa/commits/1ed6c96423585e616ffd7fa342875c70c8c0de30))
* **event-search:** validateQuery clean additional fields ([dedc410](https://bitbucket.org/openagenda/oa/commits/dedc41024b74b45ebd843abd40584b6bcbb26abe))



### [2.7.4](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.7.4..@openagenda/event-search@2.7.3) (2020-07-16)


### Bug Fixes

* fix locales ([a591d2e](https://bitbucket.org/openagenda/oa/commits/a591d2efcdd3337c406b4c0f381b1a2d4fdf0b9a))



### [2.7.3](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.7.3..@openagenda/event-search@2.7.2) (2020-07-13)

**Note:** Version bump only for package @openagenda/event-search





### [2.7.2](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.7.2..@openagenda/event-search@2.7.1) (2020-07-10)


### Bug Fixes

* fix links in changelogs ([84e2460](https://bitbucket.org/openagenda/oa/commits/84e24609981f4ee3bb9e34ef52109d74abe97a62))



### [2.7.1](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.7.1..@openagenda/event-search@2.7.0) (2020-07-08)

**Note:** Version bump only for package @openagenda/event-search





## [2.7.0](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.7.0..@openagenda/event-search@2.6.0) (2020-07-06)


### Features

* **event-search:** allow setting index shard replica values ([5f2257e](https://bitbucket.org/openagenda/oa/commits/5f2257edac8a8f967b95d247908abffe6e9dddfb))
* **event-search:** get details on cluster nodes ([4213c8a](https://bitbucket.org/openagenda/oa/commits/4213c8afd3fc4c26d3048bc1e8d63dc5460923ea))



## [2.6.0](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.6.0..@openagenda/event-search@2.5.1) (2020-06-30)


### Features

* **event-search:** provide validation error details on invalid aggregation params formatting ([693abad](https://bitbucket.org/openagenda/oa/commits/693abad9b9fc8514df63f658063b2b5ec23adbb7))



### [2.5.1](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.5.1..@openagenda/event-search@2.5.0) (2020-06-18)

**Note:** Version bump only for package @openagenda/event-search





## [2.5.0](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.5.0..@openagenda/event-search@2.4.1) (2020-06-09)


### Features

* **event-search:** filter by timestamp ([bc513d4](https://bitbucket.org/openagenda/oa/commits/bc513d4b9df59ab21b6a4235401f719f822bbeac))
* **event-search:** target field in additionalField aggregation ([399c637](https://bitbucket.org/openagenda/oa/commits/399c637fcbd0ba64231f6143d8ca768077c9a78c))


### Bug Fixes

* **event-search:** additionalFields aggregation crashes when no values are retrieved for specific field ([8e11567](https://bitbucket.org/openagenda/oa/commits/8e1156714025918d0e6fa00bf3d21041f92868b0))



### [2.4.1](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.4.1..@openagenda/event-search@2.4.0) (2020-05-22)

**Note:** Version bump only for package @openagenda/event-search





## [2.4.0](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.4.0..@openagenda/event-search@2.3.0) (2020-05-19)


### Features

* **event-search:** registration field holds a list of { type, value } pairs ([a6188f0](https://bitbucket.org/openagenda/oa/commits/a6188f0c0c362a2055663ee4cd01609be3673138))



## [2.3.0](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.3.0..@openagenda/event-search@2.2.2) (2020-05-15)


### Features

* **event-search:** add track_total_hits option to queryToDsl ([36053ee](https://bitbucket.org/openagenda/oa/commits/36053eef40fd29e14941df4fcda1c7b6d18c5dfc))
* **event-search:** createdAt/updatedAt histogram aggregations ([4be1c5b](https://bitbucket.org/openagenda/oa/commits/4be1c5b37d377e479cc6a373e9f229cac7be1478))
* **event-search:** define keys for aggregation results ([02af384](https://bitbucket.org/openagenda/oa/commits/02af3840d51575b9c29e6f463813bd94e60314be))


### Bug Fixes

* **event-search:** source agenda aggregation throws error when there are no source agendas ([9665fc0](https://bitbucket.org/openagenda/oa/commits/9665fc0147eaf555ce26e3d4713a09d01b7bba37))
* **event-search:** timings aggregation key_as_string provides bad info ([ccc4f14](https://bitbucket.org/openagenda/oa/commits/ccc4f14d40ec2a744b654220cfc70aeef3182b11))



### [2.2.2](https://bitbucket.org/openagenda/oa/branches/compare/@openagenda/event-search@2.2.2..@openagenda/event-search@2.2.1) (2020-04-07)

**Note:** Version bump only for package @openagenda/event-search





## <small>2.2.1 (2020-04-03)</small>

* linting(event-search) ([d3404d1](https://bitbucket.org/openagenda/oa/commits/d3404d1))
* use the same lodash ([aeae186](https://bitbucket.org/openagenda/oa/commits/aeae186))
* fix(event-search): forgotten textLog ([09af699](https://bitbucket.org/openagenda/oa/commits/09af699))
* feature(event-search): sandbox to run fiddle with DSL queries ([08decc8](https://bitbucket.org/openagenda/oa/commits/08decc8))
* tweak(event-search): formatEvent puts empty array for unspecified additional fields of radio type ([3c19094](https://bitbucket.org/openagenda/oa/commits/3c19094))
