"use script";

const transform = require( '../timingsTransform' ),

should = require( 'should' );

describe( 'timingsTransform', () => {

  describe( 'toTimingsWidgetFormat', () => {

    it( 'times with centiseconds are cleaned', () => {

      transform.toTimingsWidgetFormat( [ {
        date: '2016-11-15',
        begin: '09:00:00',
        end: '07:00:00'
      } ], '07:00', '07:00' )

      .should.eql( [ { 
        start: '2016-11-15T09:00:00+01:00',
        end: '2016-11-16T07:00:00+01:00' 
      } ] );

    } );

    it( 'combines begin, end and date into start/end pair', () => {

      transform.toTimingsWidgetFormat( [ {
        date: "2010-01-01",
        begin: "10:00",
        end: "15:00"
      }, {
        date: "2010-10-10",
        begin: "13:00",
        end: "20:00"
      } ], '07:00', '07:00' )

      .should.eql( [ {
         "start":"2010-01-01T10:00+01:00",
         "end":"2010-01-01T15:00+01:00"
       }, {
         "start":"2010-10-10T13:00+02:00",
         "end":"2010-10-10T20:00+02:00"
       } ] );

    } );


    it( 'if end is smaller than begin and is bigger than lastHour, the timing is filtered out', () => {

      transform.toTimingsWidgetFormat( [ {
        date: '2010-01-01',
        begin: '19:00',
        end: '15:00'
      } ], '07:00', '07:00' )

      .should.eql( [] );

    } );

    it( 'if end is same or smaller than begin and is smaller than lastHour, the timing spreads to the next day', () => {

      transform.toTimingsWidgetFormat( [ {
        date: '2010-01-01',
        begin: '19:00',
        end: '05:00'
      } ], '07:00', '07:00' )

      .should.eql( [ {
         start: "2010-01-01T19:00+01:00",
         end: "2010-01-02T05:00+01:00"
      } ] )

    } );

  } );

  describe( 'toEventFormFormat', () => {

    it( 'separates start and end into date, begin and end', () => {

      transform.toEventFormFormat( [ {
        start: "2010-01-01T10:00+01:00",
        end: "2010-01-01T15:00+01:00"
      }, {
        start: "2010-10-10T13:00+02:00",
        end: "2010-10-10T20:00+02:00"
      } ], '07:00', '07:00' )

      .should.eql( [{
        "date":"2010-01-01",
        "begin":"10:00",
        "end":"15:00"
      }, {
        "date":"2010-10-10",
        "begin":"13:00",
        "end":"20:00"
      } ] );

    } );


    it( 'if end overlaps on next day and is superior to lastHour, it is filtered out', () => {

      transform.toEventFormFormat( [ {
        start: "2010-01-01T10:00+01:00",
        end: "2010-01-02T15:00+01:00"
      } ], '07:00', '07:00' )

      .should.eql( [] );

    } );


    it( 'if end overlaps on next day and is inferior to lastHour, it is kept in same date', () => {

      transform.toEventFormFormat( [ {
        start: "2010-01-01T10:00+01:00",
        end: "2010-01-02T06:00+01:00"
      } ], '07:00', '07:00' )

      .should.eql( [{
        "date":"2010-01-01",
        "begin":"10:00",
        "end":"06:00"
      } ] );

    } );

    it( 'end cannot be same as start', () => {

      transform.toEventFormFormat( [ {
        start: "2010-01-01T10:00+01:00",
        end: "2010-01-01T10:00+01:00"
      } ], '07:00', '07:00' )

      .should.eql( [] );

    } );


  } );

} );