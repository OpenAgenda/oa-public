"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

actions = require( '../components/src/formActions' );

describe( 'form actions', () => {

  it( 'initialize - takes props and returns an initialized state', () => {

    actions.tests.initialize( {
      location: {
        uid: 12345,
        name: 'Le Bocal',
        address: '29 passage du Ponceau',
        latitude: 12,
        longitude: 13
      },
      alternatives: [ {
        location: {
          name: 'L\'aquarium',
          address: '30 passage du Ponceau',
          latitude: 14,
          longitude: 15
        }
      }, {
        location: {
          uid: 12345,
          name: 'Le Bocal',
          address: '29 passage du Ponceau',
          latitude: 12,
          longitude: 13
        }
      }, {
        location: {
          name: 'La tambouille',
          address: '31 passage du Ponceau',
          latitude: 16,
          longitude: 17
        }
      }, {
        location: {
          name: 'L\'aquarium',
          address: '34 passage du Ponceau',
          latitude: 18,
          longitude: 19
        }
      } ]
    } )

    .should.eql( {
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
        website: undefined
      },
      autoGeocode: true,
      enableGeocode: undefined,
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
        phone: 1,
        website: 1,
        latitude: 1,
        longitude: 1,
        countryCode: 1
      } ,
      pageSpin: null,
      translation: {}
    } );

  } );

  describe( 'loadAlternative', () => {

    it( 'swap currently loaded value with alternative', () => {

      let newState = actions.tests.loadAlternative( {
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
          website: undefined
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
          countryCode: 1
        }
      }, [ {
        location: {
          name: 'L\'aquarium',
          address: '30 passage du Ponceau',
          latitude: 14,
          longitude: 15
        }
      }, {
        location: {
          name: 'Le Scorbut',
          address: '31 passage du Ponceau',
          latitude: 16,
          longitude: 17
        }
      }, {
        location: {
          name: 'L\'aquarium',
          address: '34 passage du Ponceau',
          latitude: 18,
          longitude: 19
        }
      } ], 'name', 2 );

      newState.location.name.should.equal( 'L\'aquarium' );

      newState.activeAlternatives.name.should.equal( 2 );

    } );

  } );


  describe( 'loadTagAlternative', () => {

    it( 'unchecks tag', () => {

      actions.tests.loadTagAlternative( {
        location: {
          tags: [
            {
              id: 40,
              label: 'Musée de France'
            },
            {
              id: 34,
              label: 'Patrimoine'
            }
          ]
        }
      }, {
        id: 40,
        label: 'Musée de France'
      }, false )

      .location.tags.should.eql( [ {
        id: 34,
        label: 'Patrimoine'
      } ] );

    } );

    it( 'checks tag', () => {

      actions.tests.loadTagAlternative( {
        location: {
          tags: [
            {
              id: 40,
              label: 'Musée de France'
            },
            {
              id: 34,
              label: 'Patrimoine'
            }
          ]
        }
      }, {
        id: 41,
        label: 'Nouveau tag'
      }, true )

      .location.tags.should.eql( [ {
        id: 40,
        label: 'Musée de France'
      }, {
        id: 34,
        label: 'Patrimoine'
      }, {
        id: 41,
        label: 'Nouveau tag'
      } ] );

    } );

  } );


  describe( 'page spins', () => {

    it( 'start page spin', () => {

      actions.tests.startPageSpin( {
        pageSpin: null
      }, 'spinning' )

      .should.eql( {
        pageSpin: {
          message: 'spinning'
        }
      } );

    } );

    it( 'stop page spin', () => {

      actions.tests.stopPageSpin( {
        pageSpin: {
          message: 'spinning'
        }
      } )

      .should.eql( {
        pageSpin: false
      } );

    } );

  } );

} );
