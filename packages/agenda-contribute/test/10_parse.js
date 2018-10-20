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
      }, {
        image: {
          path: '/the/full/path.jpg'
        }
      } ).image.path ).toBe( '/the/full/path.jpg' );

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

  } );

} );
