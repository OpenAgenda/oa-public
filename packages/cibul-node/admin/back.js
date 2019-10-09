"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const ReactDOM = require( 'react-dom/server' );
const { parsePath } = require('history');
const moment = require( 'moment' );
const wn = require( 'when/node' );
const async = require( 'async' );
const sessions = require( '@openagenda/sessions' );
const log = require( '@openagenda/logs' )( 'admin/back' );
const agendasSvc = require( '@openagenda/agendas' );
const createInboxApp = require( '@openagenda/inbox-apps/dist/apps/inbox' );
const wrapApp = require( '@openagenda/react-utils/dist/wrapApp' );
const cmn = require( '../lib/commons-app' );
const lib = require( '../lib/lib' );
const membersSvc = require( '../services/members' );
const model = require( '../services/model' );
const adminSvc = require( '../services/admin/admin' );
const usersSvc = require( '../services/users' );
const config = require( '../config' );

const supportTemplate = _.template( require( 'fs' ).readFileSync( __dirname + '/support.tpl', 'utf-8' ) );

const preMw = [
  cmn.loadBaseData(),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
  cmn.requireSuperAdmin
];


module.exports = app => {

  app.get( '/admin', preMw, index );
  app.get( '/admin/search', preMw, search );
  app.get( '/admin/users', preMw, getUsers );
  app.get( '/admin/users/signin', preMw, _loadUser(), userSignin );
  app.get( '/admin/users/activate', preMw, _loadUser(), userActivate );
  app.post( '/admin/users/update', preMw, _loadUser( 'post' ), userUpdate );
  app.get( '/admin/throw', preMw, throwTestError );
  app.get( '/admin/users/changePassword', preMw, userChangePassword );
  app.get( '/admin/eventsbyweek', preMw, eventsByWeek );
  app.get( '/admin/eventsdiff', preMw, eventsDiff );
  app.get(
    [
      '/admin/support',
      '/admin/support/conversation/:conversationId'
    ],
    preMw,
    support
  );

};


async function support( req, res, next ) {
  const lang = req.lang || 'fr';
  const staticContext = {};
  const reactApp = createInboxApp( {
    req,
    initialState: {
      settings: {
        context: 'user',
        prefix: '/admin/support',
        lang: req.lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        autoFocus: true
      },
      res: {
        author: '/admin/support/author.json',
        conversations: {
          create: '/admin/support/conversations.json',
          list: '/admin/support/conversations.json',
          action: '/admin/support/conversations/:conversationId/action/:code.json',
          resume: '/admin/support/conversations/:conversationId/resume.json'
        },
        messages: {
          list: '/admin/support/conversations/:conversationId/messages.json',
          create: '/admin/support/conversations/:conversationId/messages.json',
          prepareAttachment: '/admin/support/conversations/:conversationId/prepare-attachment',
          addAttachment: '/admin/support/conversations/:conversationId/add-attachment'
        }
      }
    }
  } );
  const { triggerHooks, store, history } = reactApp;

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( wrapApp( reactApp, { req, staticContext } ) );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 302, staticContext.url );
    }

    const { pathname } = history.location;
    if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
      return res.redirect( 302, pathname );
    }

    res.send( supportTemplate( {
      scriptParams: { initialState:state },
      lang,
      content,
      preloaded: true
    } ) );
  } catch ( e ) {
    next( e );
  }
}


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


function throwTestError( req, res, next ) {

  throw new Error( 'this is a test error' );

}


function search( req, res ) {

  const start = moment( req.query.begin, 'DD-MM-YYYY' ).toDate();
  const end = moment( req.query.end, 'DD-MM-YYYY' ).endOf( 'day' ).toDate();

  _getFork( start, end )

    .then( ( [ r, e, u ] ) => {

      cmn.render( req, res, 'admin/index', {

        events: {
          total: e,
          totalInWeek: null,
          totalInMonth: null,
        },

        reviews: {
          total: r,
          totalInWeek: null,
          totalInMonth: null,
        },

        users: {
          total: u,
          totalInWeek: null,
          totalInMonth: null,
        },

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

        if ( !req.loadedUser.id ) return next( new Error( 'User not found' ) );

        membersSvc.list( { userUid: req.loadedUser.uid }, { limit: 500, order: 'id.desc' } ).then( members => {

          agendasSvc.list( {
            uid: members.map( m => m.agendaUid )
          }, 0, 500, { private: null }, ( err, agendas ) => {

            model.lib.query( 'SELECT count(*) as nbrEvents, agenda_uid as agendaUid ' +
              'FROM agenda_event WHERE user_uid = ? GROUP BY agenda_uid',
              [ req.loadedUser.uid ],
              ( err, counters ) => {

                members = members.map( member => {

                  member.agenda = agendas.filter( agenda => agenda.uid == member.agendaUid )[ 0 ];

                  const counter = counters.filter( counter => counter.agendaUid == member.agendaUid )[ 0 ];
                  member.nbrEvents = counter && counter.nbrEvents;

                  return member;

                } );

                cmn.renderJson( req, res, {
                  user: lib.filterByAttr( req.loadedUser, [
                    'uid',
                    'fullName',
                    'email',
                    'isActivated',
                    'isRemoved',
                    'createdAt',
                    'updatedAt',
                    'lastSignin',
                    'apiKey',
                    'apiSecret',
                    'store'
                  ] ),
                  members
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

  const { uid, password } = req.query;

  usersSvc
    .changePassword( uid, { password } )
    .then( () => {

      res.json( { success: true } );

    } )
    .catch( () => {

      res.json( { success: false } );

    } );

}


async function userActivate( req, res ) {

  if ( !req.loadedUser.isActivated ) {

    try {

      req.loadedUser = await usersSvc
        .patch( req.loadedUser.uid, { isActivated: true }, { internal: true } );

      return cmn.renderJson( req, res, { success: true } );

    } catch ( err ) {

      return cmn.catchError( req, res )( err );

    }

  }

}

function userUpdate( req, res, next ) {

  usersSvc.get( req.loadedUser.uid, { detailed: true, removed: null } )
    .then( async user => {

      const store = user.store || {};

      if ( !store.enable_secret && req.body.enable_secret ) {

        await usersSvc.generateApiKey( user.uid, {
          secretKey: true
        }, { removed: null } );

        user = await usersSvc.patch( user.uid, {
          store: {
            ...store,
            enable_secret: true
          }
        }, { detailed: true, removed: null, internal: true } );

      }

      res.json( {
        success: true,
        user
      } );

    } )
    .catch( next );

}


function userSignin( req, res ) {

  sessions.open( req, res, req.loadedUser, () => {

    if ( req.xhr ) return cmn.renderJson( req, res, { success: true } );

    return res.redirect( 302, '/home' );

  } );

}


function _loadUser( type = 'get' ) {

  return ( req, res, next ) => {

    const request = req[ type === 'get' ? 'query' : 'body' ];

    if ( !request.uid ) return cmn.renderJson( req, res, { success: false, message: 'user uid is missing' } );

    const uid = request.uid;

    usersSvc.get( uid, { removed: null, detailed: true } )
      .then( user => {

        req.loadedUser = user;

        next();

      } )
      .catch( cmn.catchError( req, res ) );

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

            return { uid: row.uid, fullName: row.full_name, email: row.email, isRemoved: row.is_removed };

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


function _getFork( begin, end ) {

  return Promise.all( [
    promisify( model.reviews().total )( { createdAt: { gte: begin, lte: end } } ),
    promisify( model.events().total )( { createdAt: { gte: begin, lte: end } } ),
    usersSvc.find( { query: { $limit: 0, createdAt: { $gte: begin, $lte: end } } } )
      .then( res => res.total )
  ] );

}

function _getTotals( cb ) {

  async.parallel( [

    async.apply( model.reviews().total ),

    async.apply( model.events().total ),

    cb => usersSvc.find( { query: { $limit: 0 } } )
      .then( res => cb( null, res.total ) )

  ], cb );
}

function _getTotalsWeek( cb ) {

  var weekStart = moment().subtract( 1, 'week' ).startOf( 'week' ).toDate(),

    weekStop = moment().subtract( 1, 'week' ).endOf( 'week' ).toDate();

  async.parallel( [

    async.apply( model.reviews().total, { createdAt: { gt: weekStart, lt: weekStop } } ),

    async.apply( model.events().total, { createdAt: { gt: weekStart, lt: weekStop } } ),

    cb => usersSvc.find( { query: { $limit: 0, createdAt: { $gt: weekStart, $lt: weekStop } } } )
      .then( res => cb( null, res.total ) )

  ], cb );
}

function _getTotalsMonth( cb ) {

  var monthStart = moment().subtract( 1, 'month' ).startOf( 'month' ).toDate(),

    monthStop = moment().subtract( 1, 'month' ).endOf( 'month' ).toDate();

  async.parallel( [

    async.apply( model.reviews().total, { createdAt: { gt: monthStart, lt: monthStop } } ),

    async.apply( model.events().total, { createdAt: { gt: monthStart, lt: monthStop } } ),

    cb => usersSvc.find( { query: { $limit: 0, createdAt: { $gt: monthStart, $lt: monthStop } } } )
      .then( res => cb( null, res.total ) )

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
