'use strict';

const buildDistancesAndEvaluate = require('../duplicates/buildDistancesAndEvaluate');

describe('agenda-locations - functional - buildDistancesAndEvaluate', () => {
  const config = {
    geoThreshold: 40,
    nameDistanceThreshold: 10,
  };

  describe('Same ExtId should resp true', () => {
    it('if same extId marked as duplicate', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Grotte Chauvet 2 - Ardèche',
        latitude: 44.406684,
        longitude: 4.429893,
        extId: 100,
      }, {
        name: 'Same extId',
        latitude: 144.406685,
        longitude: 14.429894,
        extId: 100,
      }, config);
      expect(res).toBeTruthy();
    });
  });

  describe('Locations to far appart should resp False', () => {
    it('Long name pretty close  && lat, long = 0', () => {
      const res = buildDistancesAndEvaluate({
        name: 'musée d\'Art Moderne de la Ville de Paris',
        latitude: 0.00,
        longitude: 0.00,
      }, {
        name: 'musée d\'Art Moderne de Marseille',
        latitude: 0.00,
        longitude: 0.00,
      }, config);
      expect(res).toBeFalsy();
    });

    it('Long name && lat, long = 0', () => {
      const res = buildDistancesAndEvaluate({
        name: 'musée d\'Art Moderne de la Ville de Paris',
        latitude: 0.00,
        longitude: 0.00,
      }, {
        name: 'musée des civilisations de l\'Europe et de la Méditerranée',
        latitude: 0.00,
        longitude: 0.00,
      }, config);
      expect(res).toBeFalsy();
    });

    it('Shorter name && lat, long = 0', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Fontaine de Médicis',
        latitude: 0.00,
        longitude: 0.00,
      }, {
        name: 'Pieuré',
        latitude: 0.00,
        longitude: 0.00,
      }, config);
      expect(res).toBeFalsy();
    });

    it('geo close but different Names', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Grotte Chauvet 2 - Ardèche',
        latitude: 44.406684,
        longitude: 4.429893,
      }, {
        name: 'Caverne du Pont d`Arc',
        latitude: 44.406684,
        longitude: 4.429893,
      }, config);
      expect(res).toBeFalsy();
    });
  });

  describe('Locations close enough should resp True', () => {
    it('a location with a very similar name && geo close is marked as a duplicate', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Grotte Chauvet 2',
        latitude: 44.406685,
        longitude: 4.429893,
      }, {
        name: 'Grotte Chauvet',
        latitude: 44.406685,
        longitude: 4.429894,
      }, config);
      expect(res).toBeTruthy();
    });

    it('a location with a very similar name && geo close is marked as a duplicate 2', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Gare du Nord',
        latitude: 48.8813990,
        longitude: 2.3574380,
      }, {
        name: 'Gare du Nord (RER)',
        latitude: 48.8814990,
        longitude: 2.3574380,
      }, config);
      expect(res).toBeTruthy();
    });

    it('a location with a very similar name && geo close is marked as a duplicate 3', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Gare du Nord',
        latitude: 48.8813990,
        longitude: 2.3574380,
      }, {
        name: 'RER-Gare du Nord',
        latitude: 48.8814990,
        longitude: 2.3574380,
      }, config);
      expect(res).toBeTruthy();
    });
  });
});
