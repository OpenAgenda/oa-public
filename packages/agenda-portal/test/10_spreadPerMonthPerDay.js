"use strict";

const should = require( 'should' );

const spreadPerMonth = require( '../lib/parsers/spreadPerMonthPerDay' );

describe( '10 spreadPerMonthPerDay', () => {

  const timings = [ {
    start: new Date( '2018-11-10T10:00:00+0100' ),
    end: new Date( '2018-11-10T11:00:00+0100' )
  }, {
    start: new Date( '2018-11-15T10:00:00+0100' ),
    end: new Date( '2018-11-11T15:00:00+0100' )
  }, {
    start: new Date( '2019-01-01T00:00:00+0100' ),
    end: new Date( '2019-01-01T01:00:00+0100' )
  } ];

  it( 'Timings are distributed in an array of months and sub-array of days', () => {

    const result = spreadPerMonth( timings, 'Europe/Paris', 'fr' );

    JSON.stringify( result, null, 2 ).should.equal( `[
  {
    "month": {
      "key": "2018-11",
      "label": "Novembre 2018"
    },
    "weeks": [
      {
        "week": "2",
        "label": "2",
        "days": [
          {
            "day": "10",
            "timings": [
              {
                "start": {
                  "value": "2018-11-10T09:00:00.000Z",
                  "label": "10:00"
                },
                "end": {
                  "value": "2018-11-10T10:00:00.000Z",
                  "label": "11:00"
                }
              }
            ],
            "label": "Samedi 10"
          }
        ]
      },
      {
        "week": "3",
        "label": "3",
        "days": [
          {
            "day": "15",
            "timings": [
              {
                "start": {
                  "value": "2018-11-15T09:00:00.000Z",
                  "label": "10:00"
                },
                "end": {
                  "value": "2018-11-11T14:00:00.000Z",
                  "label": "15:00"
                }
              }
            ],
            "label": "Jeudi 15"
          }
        ]
      }
    ]
  },
  {
    "month": {
      "key": "2018-12",
      "label": "Décembre 2018"
    },
    "weeks": []
  },
  {
    "month": {
      "key": "2019-01",
      "label": "Janvier 2019"
    },
    "weeks": [
      {
        "week": "1",
        "label": "1",
        "days": [
          {
            "day": "01",
            "timings": [
              {
                "start": {
                  "value": "2018-12-31T23:00:00.000Z",
                  "label": "00:00"
                },
                "end": {
                  "value": "2019-01-01T00:00:00.000Z",
                  "label": "01:00"
                }
              }
            ],
            "label": "Mardi 1"
          }
        ]
      }
    ]
  }
]` );

  } );

  it( 'When new year hits Paris, it is still 2018 in New York', () => {

    const result = spreadPerMonth( timings, 'America/New_York', 'en' );

    JSON.stringify( result, null, 2 ).should.eql( `[
  {
    "month": {
      "key": "2018-11",
      "label": "November 2018"
    },
    "weeks": [
      {
        "week": "2",
        "label": "2",
        "days": [
          {
            "day": "10",
            "timings": [
              {
                "start": {
                  "value": "2018-11-10T09:00:00.000Z",
                  "label": "4:00 AM"
                },
                "end": {
                  "value": "2018-11-10T10:00:00.000Z",
                  "label": "5:00 AM"
                }
              }
            ],
            "label": "Saturday 10"
          }
        ]
      },
      {
        "week": "3",
        "label": "3",
        "days": [
          {
            "day": "15",
            "timings": [
              {
                "start": {
                  "value": "2018-11-15T09:00:00.000Z",
                  "label": "4:00 AM"
                },
                "end": {
                  "value": "2018-11-11T14:00:00.000Z",
                  "label": "9:00 AM"
                }
              }
            ],
            "label": "Thursday 15"
          }
        ]
      }
    ]
  },
  {
    "month": {
      "key": "2018-12",
      "label": "December 2018"
    },
    "weeks": [
      {
        "week": "5",
        "label": "5",
        "days": [
          {
            "day": "31",
            "timings": [
              {
                "start": {
                  "value": "2018-12-31T23:00:00.000Z",
                  "label": "6:00 PM"
                },
                "end": {
                  "value": "2019-01-01T00:00:00.000Z",
                  "label": "7:00 PM"
                }
              }
            ],
            "label": "Monday 31"
          }
        ]
      }
    ]
  }
]` );


  } );



} );
