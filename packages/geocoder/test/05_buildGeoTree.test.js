'use strict';

const geoTreePath = `${__dirname}/fixtures/geoTree`;
const buildGeoTree = require('../Opencage/lib/buildGeoTree');

describe('buildGeoTree', () => {
  let result;
  beforeAll(async () => {
    result = buildGeoTree(geoTreePath);
    // console.log(JSON.stringify(result, null, 2));
  });
  test('country Level', () => {
    const countryNames = result.map(e => e.name);
    expect(countryNames.length).toBeGreaterThan(0);
  });
  test('AdminLevel2', () => {
    const { adminLevel2 } = result.find(e => e.name === 'FR');
    expect(adminLevel2).toBeTruthy();
  });
  test('set', () => {
    const { adminLevel4 } = result.find(e => e.name === 'FR').adminLevel2.find(e => e.name === 'Nord');
    expect(adminLevel4[0].$set).toBeTruthy();
  });
  test('multiple set', () => {
    const { adminLevel4 } = result.find(e => e.name === 'FR').adminLevel2.find(e => e.name === 'Nord');
    expect(adminLevel4.find(e => e.name === 'Aubers')).toBeTruthy();
    expect(adminLevel4.find(e => e.name === 'Lille')).toBeTruthy();
  });
  test('build It', () => {
    const build = buildGeoTree(`${__dirname}/../geoTree`);
    // console.log(JSON.stringify(build, null, 2));
    expect(build).toBeTruthy();
  });
});
