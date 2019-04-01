"use strict";

const _ = require( 'lodash' );

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
      }, null, { raw: {
        image: {
          path: '/the/full/path.jpg'
        }
      } } ).image.path ).toBe( '/the/full/path.jpg' );

    } );

    test( 'places image url in url sub key', () => {

      const url = 'https://zenith-toulousemetropole.com/images/stories/manifestations/affiche-event-goya19.jpg';
      const credits = 'Me';

      expect( parse.toEventServiceFormat( {
        image: null,
        imageCredits: credits
      }, null, { raw: {
        image: { url }
      } } ).image ).toEqual( { url, credits } );

    } );

    test( 'maintains preexisting image data in image key', () => {

      expect( parse.toEventServiceFormat( {
        image: { filename: 'something' },
      }, null, {
        raw: {
          image: {
            credits: 'the credits',
            filename: 'something',
            variants: [],
            size: { width: 12, height: 12 }
          }
        }
      } ).image ).toEqual( {
        filename: 'something',
        size: { width: 12, height: 12 },
        variants: [],
        credits: undefined
      } );

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
        timezone: null,
        location: {
          timezone: null
        },
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


    test( 'partial transform does not add fields', () => {

      expect( _.keys( parse.toEventServiceFormat( {
        title: {
          fr: 'Un titre'
        }
      }, null, { partial :true } ) ) ).toEqual( [ 'title' ] );

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

    test( 'when timezone is not specified in event data, it can be read from provided location', () => {

      expect( parse.fromEventServiceFormat( {
        timings: [ {
          begin: new Date( '2019-02-08T19:25:00+0400' ),
          end: new Date( '2019-02-08T21:00:00+0400' )
        } ]
      }, {
        location: { timezone: 'Asia/Dubai' }
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

    test( 'should works with a falsy timezone', () => {

      expect( parse.fromEventServiceFormat( {
        timings: [
          {
            "begin": "2019-03-12T23:00:00.000Z",
            "end": "2019-03-13T22:59:00.000Z"
          }
        ]
      }, {
        location: { timezone: null }
      } ).timings ).toEqual( [
        {
          "begin": {
            "date": "2019-03-13",
            "hours": "00",
            "minutes": "00"
          },
          "end": {
            "date": "2019-03-13",
            "hours": "23",
            "minutes": "59"
          }
        }
      ] );

    } );

  } );

} );
