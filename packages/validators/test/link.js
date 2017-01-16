"use strict";

var should = require( 'should' ),

validators = require( './build' );

describe( 'link validator', () => {

  describe( 'required ( default )', () => {

    var validate = validators.link( { field: 'link', optional: false } );

    it( 'an email is not a link', () => {

      let errors = [];

      try {

        validate( 'email@gmail.com' );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

    } );


    it( 'an empty input is not a link', () => {

      let errors = [];

      try {

        validate();

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 1 );

    } );


    it( 'http is added if missing', () => {

      var clean = validate( 'lemonde.fr' );

      clean.should.equal( 'http://lemonde.fr' );

    } );

    


    it( 'are links', () => {

      let errors = false,

      links = [
        '//graph.facebook.com/100002280111541/picture',
        'https://openagenda.com',
        'lemonde.fr',
        'lesjourneesdupatrimoine.gouv.fr',
        'http://www.facebook.com/pages/Maison-Des-Musiques-Alternatives/256970411014473',
        'http://www.placedesreseaux.com/Dossiers/animer-developper/initiative-collective-1.html',
        'http://www.lebaneseunderground.com/music/index.asp',
        'http://www.tourisme-ouestvar.com/les-journees-europeennes-du-patrimoine-ollioules-exposition-visites-guidees-animations.html?origine_affinage=true&mid=1&action=result&origine_affinage=true',
        'https://static.wixstatic.com/media/852505_4e3b455f81d2432d871076b2e796d8f7.png/v1/fill/w_184,h_68,al_c,usm_0.66_1.00_0.01/852505_4e3b455f81d2432d871076b2e796d8f7.png'
      ],

      notLinks = links.filter( l => {

        try {

          validate( l );

          return false;

        } catch( e ) {

          return true;

        }

      } );

      notLinks.length.should.equal( 0 );

    } );


    it( 'are not links', () => {

      let errors = false,

      links = [
        'fdsqfdssfds',
        'openagenda.com.'
      ],

      areLinks = links.filter( l => {

        try {

          validate( l );

          return true;

        } catch( e ) {

          return false;

        }

      } );

      areLinks.length.should.equal( 0 );

    } );


    it( 'not a link', () => {

      var caught = false;

      try {

        validate( 'fsqfsdq' );

      } catch( e ) {

        caught = true;

        e[ 0 ].code.should.equal( 'link.invalid' );

      }

      caught.should.equal( true );

    } );

  } );

  describe( 'optional', () => {

    var validate = validators.link( { field: 'link', optional: true } );

    it( 'empty input is ignored', () => {

      should( validate() )

      .equal( undefined );

    } );

    it( 'link validator is optional by default', () => {

      let errors = []

      try {

        validators.link()();

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

    } );

  } );

} );