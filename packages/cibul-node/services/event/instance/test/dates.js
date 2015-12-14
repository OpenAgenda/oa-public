"use strict";

var should = require( 'should' ),

d = require( '../dates' ).test;

describe( 'services/event/instance/dates', function() {


  it( 'if has only one timing display like "lundi 10 novembre de 15h à 17h"', () => {

    let dates = [{
      date: new Date( '2014-11-10T15:00:00Z' ),
      timings: [ {
        start: new Date( '2014-11-10T15:00:00Z' ),
        end: new Date( '2014-11-10T17:00:00Z' )
      } ]
    }];

    d._getRange( dates, 'fr' ).should.equal( 'lundi 10 novembre 2014 de 15h à 17h' );

    d._getRange( dates, 'en' ).should.equal( 'Monday 10 November 2014 from 15h to 17h' );

  });


  it( 'if has multiple timings in the same day and only one day, display like "mardi 10 novembre 2014 à 15h, 17h & 19h"', () => {

    let dates = [{
      date: new Date( '2014-11-10T15:00:00Z' ),
      timings: [ {
        start: new Date( '2014-11-10T15:00:00Z' ),
        end: new Date( '2014-11-10T16:00:00Z' )
      }, {
        start: new Date( '2014-11-10T17:00:00Z' ),
        end: new Date( '2014-11-10T18:00:00Z' )
      }, {
        start: new Date( '2014-11-10T19:00:00Z' ),
        end: new Date( '2014-11-10T21:00:00Z' )
      } ]
    }];


    d._getRange( dates, 'fr' ).should.equal( 'lundi 10 novembre 2014 à 15h, 17h & 19h' );

    d._getRange( dates, 'en' ).should.equal( 'Monday 10 November 2014 at 15h, 17h & 19h' );

  } );


  it( 'if has only one upcoming/ongoing timing, display is like "lundi 10 novembre de 15h à 17h"', () => {

    var now = new Date(),

    dates = [ -3, -2, -1, 0 ].map( ( offset ) => offsetDays( now, offset ) ).map( ( d ) => {

      return {
        date: d,
        timings: [ {
          start: resetHours( d, 10 ),
          end: resetHours( d, 12 )
        } ]
      }

    } );

    d._getRange( dates, 'fr' ).should.equal( d._getRange( [ dates[ 3 ] ], 'fr' ) );

  } );


  it( 'if has only one upcoming/ongoing date with several timings, display is like "lundi 10 novembre 2014 à 15h, 17h & 19h"', () => {

    var now = new Date(),

    dates = [ -3, -2, -1, 0 ].map( ( offset ) => offsetDays( now, offset ) ).map( ( d ) => {

      return {
        date: d,
        timings: [ {
          start: resetHours( d, 10 ),
          end: resetHours( d, 12 )
        }, {
          start: resetHours( d, 14 ),
          end: resetHours( d, 16 )
        } ]
      }

    } );

    d._getRange( dates, 'fr' ).should.equal( d._getRange( [ dates[ 3 ] ], 'fr' ) );

  } );


  it( 'if has 2 dates, display should be like "le lundi 10 novembre 2014 de 15h à 16h et le 12 novembre 2014 à 17h & 19h"', () => {

    let dates = [{
      date: new Date( '2014-11-10T15:00:00Z' ),
      timings: [ {
        start: new Date( '2014-11-10T15:00:00Z' ),
        end: new Date( '2014-11-10T16:00:00Z' )
      } ]
    }, {
      date: new Date( '2014-11-12T14:00:00Z' ),
      timings: [ {
        start: new Date( '2014-11-12T17:00:00Z' ),
        end: new Date( '2014-11-12T18:00:00Z' )
      }, {
        start: new Date( '2014-11-12T19:00:00Z' ),
        end: new Date( '2014-11-12T21:00:00Z' )
      } ]
    }];

    d._getRange( dates, 'fr' ).should.equal( 'le lundi 10 novembre 2014 de 15h à 16h et le 12 novembre 2014 à 17h & 19h' );
    d._getRange( dates, 'en' ).should.equal( 'Monday 10 November 2014 from 15h to 16h and the 12th November 2014 at 17h & 19h' );

  });


  it( 'if has between 3 and 4 upcoming dates, display should be like "mardi 10 novembre 2014 à 15h + x autres dates"', () => {

    var now = new Date(),

    dates = [ -2, -1, 0, +2, +3, +4 ].map( ( offset ) => offsetDays( now, offset ) ).map( ( d ) => {

      return {
        date: d,
        timings: [ {
          start: resetHours( d, 10 ),
          end: resetHours( d, 12 )
        } ]
      }

    } );

    d._getRange( dates, 'fr' ).should.equal( d._getRange( [ dates[ 2 ] ], 'fr' ) + ' + 3 autres dates' );

  });


  it( 'if has more than 4 upcoming dates, display should be like "mardi 10 novembre 2014 à 15h et jusqu\'au 5 janvier"', () => {

    var dates = [ '2024-11-10T15:00:00Z', '2024-11-12T15:00:00Z', '2024-11-18T15:00:00Z', '2024-11-20T15:00:00Z', '2024-11-22T15:00:00Z' ].map( ( d ) => {

      var date = new Date( d );

      return {
        date: date,
        timings: [ {
          start: date,
          end: resetHours( date, 20 )
        } ]
      }

    });

    d._getRange( dates, 'fr' ).should.equal( 'le dimanche 10 novembre 2024 de 15h à 16h et jusqu\'au 22 novembre 2024' );
    d._getRange( dates, 'en' ).should.equal( 'Sunday 10 November 2024 from 15h to 16h and until the 22nd November 2024' );


  });
  

  it( 'if has only passed dates, display should be like "mardi 10 novembre 2014 à 15h et jusqu\'au 5 janvier"', () => {

    var dates = [ '2014-11-10T15:00:00Z', '2014-11-12T15:00:00Z', '2014-11-18T15:00:00Z', '2014-11-20T15:00:00Z', '2014-11-22T15:00:00Z' ].map( ( d ) => {

      let date = new Date( d );

      return {
        date: date,
        timings: [ {
          start: date,
          end: resetHours( date, 20 )
        } ]
      }

    });

    d._getRange( dates, 'fr' ).should.equal( 'le lundi 10 novembre 2014 de 15h à 16h et jusqu\'au 22 novembre 2014' );
    d._getRange( dates, 'en' ).should.equal( 'Monday 10 November 2014 from 15h to 16h and until the 22nd November 2014' );

  });

  it( 'no dates: "no dates available"', () => {

    d._getRange( [], 'fr' ).should.equal( 'aucune date disponible' );
    d._getRange( [], 'en' ).should.equal( 'no dates available' );

  } );

} );

function offsetDays( date, days ) {
  
  var r = new Date( date );

  r.setDate( r.getDate() + days );

  return r;

}

function resetHours( date, h ) {

  var r = new Date( date );

  r.setHours( h );

  return r;

}