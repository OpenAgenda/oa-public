"use strict";

const sessions = require( 'sessions' ),

  modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  config = require( '../config' ),

  moment = require( 'moment' ),

  w = require( 'when' ),

  wn = require( 'when/node' ),

  async = require( 'async' ),

  log = require( 'logger' )( 'admin/back' ),

  lib = require( '../lib/lib' ),

  model = require( '../services/model' ),

  adminSvc = require( '../services/admin/admin' ),

  userOldSvc = require( '../services/user' ),

  usersSvc = require( 'users' ),

  stakeholdersSvc = require( 'agenda-stakeholders' ),

  agendasSvc = require( 'agendas' ),

  routes = {
    adminIndex: [ 'get', '/', index ],
    adminSearch: [ 'get', '/search', search ],
    adminUsers: [ 'get', '/users', getUsers ],
    adminUserSignInAs: [ 'get', '/users/signin', [
      _loadUser(),
      userSignin
    ] ],
    adminUserActivate: [ 'get', '/users/activate', [
      _loadUser(),
      userActivate
    ] ],
    adminUserUpdate: [ 'post', '/users/update', [
      _loadUser( 'post' ),
      userUpdate
    ] ],
    adminUserChangePassword: [ 'get', '/users/changePassword', userChangePassword ],
    eventsByWeek: [ 'get', '/eventsbyweek', eventsByWeek ],
    eventsDiff: [ 'get', '/eventsdiff', eventsDiff ]
  };


module.exports = path => {

  var router = modLib.Router( routes );

  moment.locale( 'fr' );

  router.pre( [
    cmn.loadBaseData(),
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    cmn.requireAdmin
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};


function index( req, res ) {

  var totals = {},

    totalsWeek = {},

    totalsMonth = {};

  log( 'rendering index' );

  wn.call( _getTotals )

    .spread( function ( rt, et, ut ) {

      totals.reviews = rt;
      totals.events = et;
      totals.users = ut;

      return wn.call( _getTotalsWeek );

    } )

    .spread( function ( rtw, etw, utw ) {

      totalsWeek.reviews = rtw;
      totalsWeek.events = etw;
      totalsWeek.users = utw;

      return wn.call( _getTotalsMonth );

    } )

    .spread( function ( rtm, etm, utm ) {

      totalsMonth.reviews = rtm;
      totalsMonth.events = etm;
      totalsMonth.users = utm;

      cmn.render( req, res, 'admin/index', _layoutData( totals, totalsWeek, totalsMonth ) );

    } )

    .catch( function ( err ) {

      log( err.message );

    } );


}


function search( req, res ) {

  var start = moment( req.query.begin, 'DD-MM-YYYY' ).toDate(),

    end = moment( req.query.end, 'DD-MM-YYYY' ).endOf( 'day' ).toDate();

  wn.call( _getFork, start, end )

    .spread( function ( r, e, u ) {

      cmn.render( req, res, 'admin/index', {

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

      } );

    } )

    .catch( function ( err ) {

      log( err.message );

    } );

}


function getUsers( req, res, next ) {

  if ( req.xhr ) {

    if ( req.query.uid ) {

      return _loadUser()( req, res, () => {

        if ( !req.loadedUser.id ) return next( 'User not found' );

        stakeholdersSvc.user( req.loadedUser.id ).list( 0, 500, ( err, stakeholders = [] ) => {

          agendasSvc.list( {
            ids: stakeholders.map( item => item.agendaId )
          }, 0, 500, { private: null }, ( err, agendas ) => {

            model.lib.query( 'SELECT count(*) as nbrEvents, review_id ' +
              'FROM review_article WHERE user_id = ? GROUP BY review_id',
              [ req.loadedUser.id ],
              ( err, counters ) => {

                stakeholders = stakeholders.map( stakeholder => {

                  stakeholder.agenda = agendas.filter( agenda => agenda.id == stakeholder.agendaId )[ 0 ];

                  const counter = counters.filter( counter => counter.review_id == stakeholder.agendaId )[ 0 ];
                  stakeholder.nbrEvents = counter && counter.nbrEvents;

                  return stakeholder;

                } );

                cmn.renderJson( req, res, {
                  user: lib.filterByAttr( req.loadedUser, [
                    'uid',
                    'full_name',
                    'email',
                    'is_activated',
                    'is_removed',
                    'created_at',
                    'updated_at',
                    'last_signin',
                    'store'
                  ] ),
                  stakeholders
                } );

              } );

          } );

        } );

      } );

    } else {

      return _searchUsers( req, res );

    }

  }

  cmn.render( req, res, 'admin/users', {
    head: {
      css: {
        main: '/css/compiledAdmin.css'
      }
    }
  } );

}


function userChangePassword( req, res ) {

  const { uid, password: new_password } = req.query;

  usersSvc.changePassword( { uid, new_password }, ( err, result ) => {

    if ( err || !result.success ) return res.json( { success: false } );
    res.json( { success: true } );

  } );

}


function userActivate( req, res ) {

  userOldSvc.activation.activate( req.loadedUser, function ( err, result ) {

    if ( err ) return cmn.catchError( req, res )( err );

    return cmn.renderJson( req, res, { success: true } );

  } );

}

function userUpdate( req, res, next ) {

  usersSvc.update( req.loadedUser.id, req.body, { internal: true }, err => {

    if ( err ) return next( err );

    usersSvc.get( req.loadedUser.id, { removed: true, detailed: true, store: true }, ( err, result ) => {

      if ( err ) return next( err );

      // Set new API secret key when admin activate enable_secret
      if ( !(req.loadedUser.store && req.loadedUser.store.enable_secret) && req.body.enable_secret ) {

        usersSvc.generateApiKey( { id: req.loadedUser.id }, { secret: true }, err => {

          if ( err ) return next( err );

          res.json( {
            success: true,
            user: result
          } );

        } )

      } else {

        res.json( {
          success: true,
          user: result
        } );

      }

    } );

  } );

}


function userSignin( req, res ) {

  sessions.open( req, res, req.loadedUser, () => {

    if ( req.xhr ) return cmn.renderJson( req, res, { success: true } );

    return res.redirect( 302, req.genUrl( 'homeShow' ) );

  } );

}


function _loadUser( type = 'get' ) {

  return ( req, res, next ) => {

    const request = req[ type === 'get' ? 'query' : 'body' ];

    if ( !request.uid ) return cmn.renderJson( req, res, { success: false, message: 'user uid is missing' } );

    var uid = request.uid;

    usersSvc.get( { uid }, { removed: true, detailed: true, store: true }, ( err, result ) => {

      if ( err ) return cmn.catchError( req, res )( err );

      req.loadedUser = result;

      next();

    } );

  }

}

function _searchUsers( req, res ) {

  var perPage = 40, page = req.query.page ? parseInt( req.query.page, 10 ) : 1,

    where = ' where is_removed = 0',

    entries = [],

    total = 0;

  if ( req.query.search ) {

    where += ' and email like ? or full_name like ?';
    entries.push( `%${req.query.search}%`, `%${req.query.search}%` );

  }

  model.lib.query(
    'select count(id) as total from user' + where,
    entries,
    function ( err, rows ) {

    if ( err ) return cmn.catchError( req, res )( err );

    total = rows[ 0 ].total;

    model.lib.query( 'select * from user' + where + ' order by created_at desc limit ' + (page - 1) * perPage + ', ' + perPage, entries, function ( err, rows ) {

      if ( err ) return cmn.catchError( req, res )( err );

      cmn.renderJson( req, res, {
        users: rows.map( function ( row ) {

          return { uid: row.uid, fullName: row.full_name, email: row.email, is_removed: row.is_removed };

        } ),
        page: page,
        total: total,
        perPage: perPage
      } )

    } );

  } );

}


function eventsByWeek( req, res ) {

  adminSvc.getIndexedEventsByWeek( function ( err, result ) {

    if ( err ) return cmn.errorResponse( req, res, err );

    cmn.renderJson( req, res, {
      success: true,
      data: result
    } );

  } );

}


function eventsDiff( req, res ) {

  adminSvc.getIndexDiff( function ( err, diff ) {

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

  async.parallel( [

    async.apply( model.reviews().total ),

    async.apply( model.events().total ),

    async.apply( model.users().total )

  ], cb );
}

function _getTotalsWeek( cb ) {

  var weekStart = moment().subtract( 1, 'week' ).startOf( 'week' ).toDate(),

    weekStop = moment().subtract( 1, 'week' ).endOf( 'week' ).toDate();

  async.parallel( [

    async.apply( model.reviews().total, { createdAt: { gt: weekStart, lt: weekStop } } ),

    async.apply( model.events().total, { createdAt: { gt: weekStart, lt: weekStop } } ),

    async.apply( model.users().total, { createdAt: { gt: weekStart, lt: weekStop } } )

  ], cb );
}

function _getTotalsMonth( cb ) {

  var monthStart = moment().subtract( 1, 'month' ).startOf( 'month' ).toDate(),

    monthStop = moment().subtract( 1, 'month' ).endOf( 'month' ).toDate();

  async.parallel( [

    async.apply( model.reviews().total, { createdAt: { gt: monthStart, lt: monthStop } } ),

    async.apply( model.events().total, { createdAt: { gt: monthStart, lt: monthStop } } ),

    async.apply( model.users().total, { createdAt: { gt: monthStart, lt: monthStop } } )

  ], cb );

}


var _layoutData = function ( totals, totalsWeek, totalsMonth ) {

  return {

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
