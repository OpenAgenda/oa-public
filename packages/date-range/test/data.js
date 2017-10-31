"use strict";

var year = 2017;

module.exports = {
  oneDate:{
    winterDefault: [
             {
               start: new Date( year + '-12-18T07:00:00Z' ),
               end:   new Date( year + '-12-18T08:00:00Z' )
             },
             {
               start: new Date( year + '-12-18T10:00:00Z' ),
               end:   new Date( year + '-12-18T10:30:00Z' )
             },
             {
               start: new Date( year + '-12-18T11:00:00Z' ),
               end:   new Date( year + '-12-18T12:00:00Z' )
             },

    ],
    summerDefault: [
             {
               start: new Date( year + '-04-18T07:00:00Z' ),
               end:   new Date( year + '-04-18T08:00:00Z' )
             },
             {
               start: new Date( year + '-04-18T10:00:00Z' ),
               end:   new Date( year + '-04-18T10:30:00Z' )
             },
             {
               start: new Date( year + '-04-18T11:00:00Z' ),
               end:   new Date( year + '-04-18T12:00:00Z' )
             },

    ],
    differentYear: [
             {
               start: new Date( '2014-12-18T07:00:00Z' ),
               end:   new Date( '2014-12-18T08:00:00Z' )
             },
             {
               start: new Date( '2014-12-18T10:00:00Z' ),
               end:   new Date( '2014-12-18T10:30:00Z' )
             },
             {
               start: new Date( '2014-12-18T11:00:00Z' ),
               end:   new Date( '2014-12-18T12:00:00Z' )
             },

    ],
  },

  twoDates:{

    default: [
            {
              start: new Date( year + '-12-16T07:00:00Z' ),
              end:   new Date( year + '-12-16T08:00:00Z' )
            },
            {
              start: new Date( year + '-12-18T10:00:00Z' ),
              end:   new Date( year + '-12-18T10:30:00Z' )
            },
    ],

    differentYear: [
            {
              start: new Date( '2014-12-16T07:00:00Z' ),
              end:   new Date( '2014-12-16T08:00:00Z' )
            },
            {
              start: new Date( '2014-12-18T10:00:00Z' ),
              end:   new Date( '2014-12-18T10:30:00Z' )
            },
    ],
    oneDifferentYear: [
      {
        start: new Date( '2014-12-16T07:00:00Z' ),
        end:   new Date( '2014-12-16T08:00:00Z' )
      },
      {
        start: new Date( year + '-12-18T10:00:00Z' ),
        end:   new Date( year + '-12-18T10:30:00Z' )
      },
    ]
  },

  moreDates: {
    default: [
            {
              start: new Date( year + '-12-16T07:00:00Z' ),
              end:   new Date( year + '-12-16T08:00:00Z' )
            },
            {
              start: new Date( year + '-12-18T10:00:00Z' ),
              end:   new Date( year + '-12-18T10:30:00Z' )
            },
            {
              start: new Date( year + '-12-19T10:00:00Z' ),
              end:   new Date( year + '-12-19T10:30:00Z' )
            },
            {
              start: new Date( year + '-12-19T13:00:00Z' ),
              end:   new Date( year + '-12-19T13:30:00Z' )
            },
    ],
    multipleMonths: [
            {
              start: new Date( year + '-11-16T07:00:00Z' ),
              end:   new Date( year + '-11-16T08:00:00Z' )
            },
            {
              start: new Date( year + '-11-18T10:00:00Z' ),
              end:   new Date( year + '-11-18T10:30:00Z' )
            },
            {
              start: new Date( year + '-12-19T10:00:00Z' ),
              end:   new Date( year + '-12-19T10:30:00Z' )
            },
            {
              start: new Date( year + '-12-19T13:00:00Z' ),
              end:   new Date( year + '-12-19T13:30:00Z' )
            },
    ],
    tuesdays: [
      {
        start: new Date( '2015-12-01T07:00:00Z' ),
        end:   new Date( '2015-12-01T08:00:00Z' )
      },
      {
        start: new Date( '2015-12-08T10:00:00Z' ),
        end:   new Date( '2015-12-08T10:30:00Z' )
      },
      {
        start: new Date( '2015-12-15T07:00:00Z' ),
        end:   new Date( '2015-12-15T08:00:00Z' )
      },
      {
        start: new Date( '2015-12-22T10:00:00Z' ),
        end:   new Date( '2015-12-22T10:30:00Z' )
      }
    ]
  }
};
