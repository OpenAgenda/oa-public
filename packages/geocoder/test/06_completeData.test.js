'use strict';

const completeData = require('../Opencage/lib/completeData');
const geoTreeEx = require('./fixtures/geoTreeEx.json');

const locationLille = {
  address: 'Rue des Stations, 59013 Lille, France',
  district: 'Wazemmes',
  adminLevel5: 'Lille-Centre',
  adminLevel4: 'Lille',
  adminLevel2: 'Nord',
  adminLevel1: 'Hauts-de-France',
  country: 'France',
  countryCode: 'fr'
};

describe('completeData', () => {
  test('Location in Lille gets AdminLevel3', () => {
    const result = completeData(locationLille, geoTreeEx);
    expect(result.adminLevel3).toBeTruthy();
  });
  test('Location in Bordeaux gets AdminLevel3', () => {
    const result = completeData({
      address: 'blabla, France',
      adminLevel4: 'Bordeaux',
      adminLevel2: 'Gironde',
      adminLevel1: 'Nouvelle-Aquitaine',
      country: 'France',
      countryCode: 'fr'
    }, geoTreeEx);
    expect(result.adminLevel3).toBe('Bordeaux Métropole');
  });
  test('Location in Anthenay gets AdminLevel3', () => {
    const result = completeData({
      address: 'blabla, France',
      adminLevel4: 'Anthenay',
      adminLevel2: 'Marne',
      adminLevel1: 'Grand Est',
      country: 'France',
      countryCode: 'fr'
    }, geoTreeEx);
    expect(result.adminLevel3).toBe('Grand Reims');
  });
  test('Location in Bordeaux with no AdminLevel2', () => {
    const entry = {
      address: 'blabla, France',
      adminLevel4: 'Bordeaux',
      adminLevel1: 'Nouvelle-Aquitaine',
      country: 'France',
      countryCode: 'fr'
    };
    const result = completeData(entry, geoTreeEx);
    expect(result).toEqual(entry);
  });
});
