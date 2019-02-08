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

    test( 'timings are converted to date format in default timezone', () => {

      expect( parse.toEventServiceFormat( {
        timezone: 'Europe/Paris',
        timings: [ {
          begin: {
            date: '2019-02-08',
            hours: '19',
            minutes: '25'
          },
          end: {
            date: '2019-02-08',
            hours: '21',
            minutes: '00'
          }
        } ]
      } ).timings ).toEqual( [ {
        begin: '2019-02-08T19:25:00+01:00',
        end: '2019-02-08T21:00:00+01:00'
      } ] );

    } );


    test( 'timings are converted to date format in other timezone', () => {

      expect( parse.toEventServiceFormat( {
        timezone: 'Asia/Dubai',
        timings: [ {
          begin: {
            date: '2019-02-08',
            hours: '19',
            minutes: '25'
          },
          end: {
            date: '2019-02-08',
            hours: '21',
            minutes: '00'
          }
        } ]
      } ).timings ).toEqual( [ {
        begin: '2019-02-08T19:25:00+04:00',
        end: '2019-02-08T21:00:00+04:00'
      } ] );

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
      } ).image ).toEqual( null );

    } );

    test( 'keep image as url if url is provided', () => {

      expect( parse.fromEventServiceFormat( {
        image: {
          url: 'https://zenith-toulousemetropole.com/images/stories/manifestations/affiche-event-goya19.jpg'
        }
      } ).image ).toEqual( {
        url: 'https://zenith-toulousemetropole.com/images/stories/manifestations/affiche-event-goya19.jpg'
      } );

    } );

    test( 'timings are converted to timezone-less format', () => {

      expect( parse.fromEventServiceFormat( {
        timezone: 'Europe/Paris',
        timings: [ {
          begin: new Date( '2019-02-08T19:25:00+0100' ),
          end: new Date( '2019-02-08T21:00:00+0100' )
        } ]
      } ).timings ).toEqual( [ {
        begin: {
          date: '2019-02-08',
          hours: '19',
          minutes: '25'
        },
        end: {
          date: '2019-02-08',
          hours: '21',
          minutes: '00'
        }
      } ] );

    } );

    test( 'timings defined for other timezone are set in other timezone', () => {

      expect( parse.fromEventServiceFormat( {
        timezone: 'Asia/Dubai',
        timings: [ {
          begin: new Date( '2019-02-08T19:25:00+0100' ),
          end: new Date( '2019-02-08T21:00:00+0100' )
        } ]
      } ).timings ).toEqual( [ {
        begin: {
          date: '2019-02-08',
          hours: '22',
          minutes: '25'
        },
        end: {
          date: '2019-02-09',
          hours: '00',
          minutes: '00'
        }
      } ] );

    } );

  } );

} );
