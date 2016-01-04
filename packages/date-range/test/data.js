"use strict";

var year = ( new Date().getFullYear() );

module.exports = {
  oneDate:{
    default: [
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
    ]
  }
};
