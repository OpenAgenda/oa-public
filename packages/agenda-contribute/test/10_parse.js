"use strict";

const parse = require( '../server/parse' );

describe( 'agenda-contribute - parse - unit ( server )', () => {

  describe( 'toEventServiceFormat', () => {

    test( 'places imageCredits in image', () => {

      expect( parse.toEventServiceFormat( {
        image: { filename: 'something' },
        imageCredits: 'Kaoré 2018'
      } ).image.credits ).toBe( 'Kaoré 2018' );

    } );

    test( 'places loaded image in path sub key', () => {

      expect( parse.toEventServiceFormat( {
        image: 'path.jpg'
      }, null, {
        image: {
          path: '/the/full/path.jpg'
        }
      } ).image.path ).toBe( '/the/full/path.jpg' );

    } );

    test( 'places image url in url sub key', () => {

      const url = 'https://zenith-toulousemetropole.com/images/stories/manifestations/affiche-event-goya19.jpg';
      const credits = 'Me';

      expect( parse.toEventServiceFormat( {
        image: null,
        imageCredits: credits
      }, null, {
        image: { url }
      } ).image ).toEqual( { url, credits } );

    } );

    test( 'only location uid is referenced in locationUid key', () => {

      expect( parse.toEventServiceFormat( {
        location: {
          uid: 123
        }
      } ).locationUid ).toBe( 123 );

    } );

  } );

  describe( 'fromEventServiceFormat', () => {

    test( 'places image credits in imageCredits', () => {

      expect( parse.fromEventServiceFormat( {
        image: {
          credits: 'Kaoré 2018'
        }
      } ).imageCredits ).toBe( 'Kaoré 2018' );

    } );

    test( 'sets image to null if file name is not set', () => {

      expect( parse.fromEventServiceFormat( {
        image: {
          filename: null
        }
      } ) ).toEqual( {
        image: null
      } );

    } );

    test( 'keep image as url if url is provided', () => {

      expect( parse.fromEventServiceFormat( {
        image: {
          url: 'https://zenith-toulousemetropole.com/images/stories/manifestations/affiche-event-goya19.jpg'
        }
      } ) ).toEqual( {
        image: {
          url: 'https://zenith-toulousemetropole.com/images/stories/manifestations/affiche-event-goya19.jpg'
        }
      } );

    } );

  } );

} );
