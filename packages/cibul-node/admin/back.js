"use strict";

var appName = 'admin/back',

exposed = {
  load: load
},

routes = {
  adminIndex: [ 'get', index, '' ],
  adminSearch: [ 'get', search, '/search' ],
  eventsByWeek: [ 'get', eventsByWeek, '/eventsbyweek' ],
  eventsDiff: [ 'get', eventsDiff, '/eventsdiff' ]
},

async = require( 'async' ),

log = require( '../lib/logger' )( appName ),

lib = require( '../lib/lib' ), 

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

moment = require( 'moment' ),

w = require( 'when' ),

wn = require( 'when/node' ),

app,

path,

model = cmn.getCibulModel(),

adminSvc = require( '../services/admin/admin' );

module.exports = function init( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}

function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded' );

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  moment.locale( 'fr' );

  log( 'app loaded' );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.flashSetter,
    cmn.loadBaseData(),
    cmn.loadSession,
    cmn.requireLogged,
    cmn.requireAdmin
  ] );

  log( 'loaded' );

  return exposed;

}

function index( req, res ) {

  var totals = {},

  totalsWeek = {},

  totalsMonth = {};

  log( 'rendering index' );
  
  wn.call( _getTotals )

  .spread( function( rt, et, ut ) {

    totals.reviews = rt;
    totals.events = et;
    totals.users = ut;

    return wn.call( _getTotalsWeek );

  } )

  .spread( function( rtw, etw, utw ) {

    totalsWeek.reviews = rtw;
    totalsWeek.events = etw;
    totalsWeek.users = utw;

    return wn.call( _getTotalsMonth );

  } )

  .spread( function( rtm, etm, utm ) {

    totalsMonth.reviews = rtm;
    totalsMonth.events = etm;
    totalsMonth.users = utm;

    cmn.render( req, res, 'admin/index', _layoutData( totals, totalsWeek, totalsMonth ) );

  } )

  .catch( function( err ) {

    log( err.message );

  } );


}

function search( req, res ) {

  var start = moment( req.query.begin, 'DD-MM-YYYY' ).toDate(),

  end = moment( req.query.end, 'DD-MM-YYYY' ).endOf('day').toDate();

  wn.call( _getFork, start, end )

  .spread( function( r, e, u ) {

    cmn.render( req, res, 'admin/index', {
      head: {
        css: {
          main: '//d.cibul.net/css/compiled.css'
        }
      },

      events: {
        total: e,
        totalInWeek: null,
        totalInMonth: null
      },

      reviews: {
        total: r,
        totalInWeek: null,
        totalInMonth: null
      },

      users: {
        total: u,
        totalInWeek: null,
        totalInMonth: null
      }

    });
  
  } )

  .catch( function ( err ) {

    log( err.message );

  });

}


function eventsByWeek( req, res ) {

  adminSvc.getIndexedEventsByWeek( function( err, result ) {

    if ( err ) return cmn.errorResponse( req, res, err );

    cmn.renderJson( req, res, {
      success: true,
      data: result
    });

  });

}


function eventsDiff( req, res ) {

  adminSvc.getIndexDiff( function( err, diff ) {

    if ( err ) return cmn.errorResponse( req, res, err );

    cmn.renderJson( req, res, {
      success: true,
      diff: diff
    } );

  } )

}


function _getFork( begin, end, cb ) {

  async.series( [

    async.apply( model.reviews().total, { createdAt: { gte: begin, lte: end } } ),

    async.apply( model.events().total, { createdAt: { gte: begin, lte: end } } ),

    async.apply( model.users().total, { createdAt: { gte: begin, lte: end } } )

    ], cb );

}

function _getTotals( cb ) {

  async.parallel([

    async.apply( model.reviews().total ),

    async.apply( model.events().total ),

    async.apply( model.users().total )

    ], cb );
}

function _getTotalsWeek( cb ) {

  var weekStart = moment().subtract( 1, 'week' ).startOf( 'week' ).toDate(),

  weekStop = moment().subtract( 1, 'week' ).endOf( 'week' ).toDate();

  async.parallel([

    async.apply( model.reviews().total, {createdAt: { gt: weekStart, lt: weekStop } } ),

    async.apply( model.events().total, {createdAt: { gt: weekStart, lt: weekStop } } ),

    async.apply( model.users().total, {createdAt: { gt: weekStart, lt: weekStop } } )

    ], cb );
}

function _getTotalsMonth( cb ) {

  var monthStart = moment().subtract( 1, 'month' ).startOf( 'month' ).toDate(),

  monthStop = moment().subtract( 1, 'month' ).endOf( 'month' ).toDate();

  async.parallel([

    async.apply( model.reviews().total, { createdAt: { gt: monthStart, lt: monthStop } } ),

    async.apply( model.events().total, { createdAt: { gt: monthStart, lt: monthStop } } ),

    async.apply( model.users().total, { createdAt: { gt: monthStart, lt: monthStop } } )

    ], cb );

}


var _layoutData = function( totals, totalsWeek, totalsMonth ) {

  return {
    head: {
      css: {
        main: '//d.cibul.net/css/compiled.css'
      }
    },

    events: {
      total: totals.events,
      totalInWeek: totalsWeek.events,
      totalInMonth: totalsMonth.events
    },

    reviews: {
      total: totals.reviews,
      totalInWeek: totalsWeek.reviews,
      totalInMonth: totalsMonth.reviews
    },

    users: {
      total: totals.users,
      totalInWeek: totalsWeek.users,
      totalInMonth: totalsMonth.users
    }

  };

};
