"use strict";

const validators = require( '../src' );

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

      expect(errors.length).toBe(1);

    } );


    it( 'an email prefixed with mailto: is a link', () => {

      const clean = validate( 'mailto:email@gmail.com' );

      expect(clean).toBe('mailto:email@gmail.com');

    } );


    it( 'an empty input is not a link', () => {

      let errors = [];

      try {

        validate();

      } catch( e ) {

        errors = e;

      }

      expect(errors.length).toBe(1);

    } );

    it( 'redos! - your processor did not sink', () => {

      [
        'http://www.scenesetcines.fr/index.php?id=68&no_cache=1&tx_xmloparser_pi1%5Bitem%5D=30002746&tx_xmloparser_pi1%5BbackPid%5D=2&PHPSESSID=11a611c62b026547e8de23e6d6576907, http://www.artefact-lab.com/',
        'https://www.facebook.com/events/1876712549261961/?acontext=%7B%22source%22%3A5%2C%22page_id_source%22%3A1916781171902508%2C%22action_history%22%3A[%7B%22surface%22%3A%22page%22%2C%22mechanism%22%3A%22main_list%22%2C%22extra_data%22%3A%22%7B%5C%22page_id%5'
      ].forEach( l => {

        //console.log( 'redos-able: %s', l );

        try {

          validate( l );

        } catch( e ) {


        }

      } );

    } );

    it( 'http is added if missing', () => {

      var clean = validate( 'lemonde.fr' );

      expect(clean).toBe('http://lemonde.fr');

    } );


    it( 'are links', () => {

      let errors = false,

      links = [
        'https://www.facebook.com/events/1876712549261961/?acontext=%7B%22source%22%3A5%2C%22page_id_source%22%3A1916781171902508%2C%22action_history%22%3A[%7B%22surface%22%3A%22page%22%2C%22mechanism%22%3A%22main_list%22%2C%22extra_data%22%3A%22%7B%5C%22page_id%5',
        'http://jereserve.maplace.fr/reservation.php?menu=evenement&societe=Espace+Simone+Signoret&filtre_lieu=ESPACE+SIMONE+SIGNORET&filtre_date=2018-10-10+15%3A00%3A00&filtre_spectacle=L%E0-Haut',
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

      expect(notLinks.length).toBe(0);

    } );


    it( 'are not links', () => {

      let errors = false,

      links = [
        'fdsqfdssfds',
        'openagenda.com.',
        'http://www/:a-url.com',
        'http://www.bourg-en-gironde.fr;www.remut.fr/actualite/4477'
      ],

      areLinks = links.filter( l => {

        try {

          validate( l );

          return true;

        } catch( e ) {

          return false;

        }

      } );

      expect(areLinks.length).toBe(0);

    } );


    it( 'not a link', () => {

      var caught = false;

      try {

        validate( 'fsqfsdq' );

      } catch( e ) {

        caught = true;

        expect(e[ 0 ].code).toBe('link.invalid');

      }

      expect(caught).toBe(true);

    } );

  } );

  describe( 'optional', () => {

    const validate = validators.link( { field: 'link', optional: true } );

    it( 'empty input is ignored', () => {

      expect( validate() ).toBeUndefined();

    } );

    it( 'if default is provided, default is used', () => {

      const validate = validators.link( { field: 'link', optional: true, default: null } );

      expect( validate() ).toBeNull();

    } );

    it( 'link validator is optional by default', () => {

      let errors = []

      try {

        validators.link()();

      } catch( e ) {

        errors = e;

      }

      expect(errors.length).toBe(0);

    } );

  } );

} );
