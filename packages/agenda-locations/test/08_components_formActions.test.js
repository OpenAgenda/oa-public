'use strict';

const actions = require('../components/src/formActions');

describe('form actions', () => {
  it('initialize - takes props and returns an initialized state', () => {
    expect(
      actions.tests
        .initialize({
          location: {
            uid: 12345,
            name: 'Le Bocal',
            address: '29 passage du Ponceau',
            latitude: 12,
            longitude: 13,
          },
          alternatives: [
            {
              location: {
                name: "L'aquarium",
                address: '30 passage du Ponceau',
                latitude: 14,
                longitude: 15,
              },
            },
            {
              location: {
                uid: 12345,
                name: 'Le Bocal',
                address: '29 passage du Ponceau',
                latitude: 12,
                longitude: 13,
              },
            },
            {
              location: {
                name: 'La tambouille',
                address: '31 passage du Ponceau',
                latitude: 16,
                longitude: 17,
              },
            },
            {
              location: {
                name: "L'aquarium",
                address: '34 passage du Ponceau',
                latitude: 18,
                longitude: 19,
              },
            },
          ],
        })
    ).toStrictEqual({
      location: {
        uid: 12345,
        name: 'Le Bocal',
        address: '29 passage du Ponceau',
        latitude: 12,
        longitude: 13,
        countryCode: undefined,
        description: undefined,
        access: undefined,
        phone: undefined,
        email: undefined,
        website: undefined,
      },
      autoGeocode: true,
      enableGeocode: undefined,
      geocodeNoResults: false,
      showGeocodeLink: false,
      geocodeLoading: false,
      loadingError: false,
      errors: false,
      geocodeError: false,
      // indicates which suggestion is currently loaded
      // in field
      activeAlternatives: {
        name: 1,
        address: 1,
        description: 1,
        access: 1,
        email: 1,
        phone: 1,
        website: 1,
        latitude: 1,
        longitude: 1,
        countryCode: 1,
      },
      pageSpin: null,
      showExtIdInput: false,
      translation: {},
    });
  });

  describe('loadAlternative', () => {
    it('swap currently loaded value with alternative', () => {
      const newState = actions.tests.loadAlternative(
        {
          location: {
            uid: 12345,
            name: 'La tambouille',
            address: '31 passage du Ponceau',
            latitude: 16,
            longitude: 17,
            countryCode: undefined,
            description: undefined,
            access: undefined,
            phone: undefined,
            website: undefined,
          },
          autoGeocode: true,
          showGeocodeLink: false,
          geocodeLoading: false,
          loading: false,
          loadingError: false,
          errors: false,
          geocodeError: false,
          // indicates which suggestion is currently loaded
          // in field
          activeAlternatives: {
            name: 1,
            address: 1,
            description: 1,
            access: 1,
            phone: 1,
            website: 1,
            latitude: 1,
            longitude: 1,
            countryCode: 1,
          },
        },
        [
          {
            location: {
              name: "L'aquarium",
              address: '30 passage du Ponceau',
              latitude: 14,
              longitude: 15,
            },
          },
          {
            location: {
              name: 'Le Scorbut',
              address: '31 passage du Ponceau',
              latitude: 16,
              longitude: 17,
            },
          },
          {
            location: {
              name: "L'aquarium",
              address: '34 passage du Ponceau',
              latitude: 18,
              longitude: 19,
            },
          },
        ],
        'name',
        2
      );
      expect(newState.location.name).toEqual("L'aquarium");
      expect(newState.activeAlternatives.name).toEqual(2);
    });
  });

  describe('loadTagAlternative', () => {
    it('unchecks tag', () => {
      expect(
        actions.tests.loadTagAlternative({
          location: {
            tags: [
              {
                id: 40,
                label: 'Musée de France',
              },
              {
                id: 34,
                label: 'Patrimoine',
              },
            ],
          },
        }, { id: 40, label: 'Musée de France' }, false).location.tags
      ).toEqual([{
        id: 34,
        label: 'Patrimoine',
      }]);
    });

    it('checks tag', () => {
      expect(actions.tests.loadTagAlternative({
        location: {
          tags: [
            {
              id: 40,
              label: 'Musée de France',
            },
            {
              id: 34,
              label: 'Patrimoine',
            },
          ],
        },
      },
      {
        id: 41,
        label: 'Nouveau tag',
      }, true).location.tags).toEqual([
        {
          id: 40,
          label: 'Musée de France',
        },
        {
          id: 34,
          label: 'Patrimoine',
        },
        {
          id: 41,
          label: 'Nouveau tag',
        },
      ]);
    });
  });

  describe('page spins', () => {
    it('start page spin', () => {
      expect(actions.tests.startPageSpin({ pageSpin: null }, 'spinning')).toEqual({
        pageSpin: {
          message: 'spinning',
        },
      });
    });

    it('stop page spin', () => {
      expect(actions.tests
        .stopPageSpin({
          pageSpin: {
            message: 'spinning',
          },
        })).toEqual({
        pageSpin: false,
      });
    });
  });
});
