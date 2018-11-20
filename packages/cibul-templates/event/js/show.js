"use strict";

var eventMap = require( './map' ),

utils = require( '@openagenda/utils' ),

du = require( '@openagenda/dom-utils' ),

get = require( '@openagenda/utils/get' ),

session = require( '@openagenda/sessions/client' ),

adminControls = require( '../../user/js/adminControls' ),

ownershipTransfer = require( './ownershipTransfer' ),

displayReferences = require( './displayReferences' ),

privateData = require( './privateData' ),

hours = require( './hours' ),

debug = require( 'debug' ), log,

ROLES = {
  EVENTEDITOR: 2,     // owner or admin/moderator of agenda having edition rights over event
  AGENDAMODERATOR: 3, // moderator of current agenda env
  AGENDAADMIN: 4      // admin of current agenda env
},

defaults = {
  selectors: {},
  agendaUid: false,     // uid of the current agenda environment
  ownerUid: false,      // uid of the owner
  adminAgendaUids: []  // uids of agendas with admin rights on event
};

defaults.selectors[ ROLES.EVENTEDITOR ] = '.js_role_event_editor';
defaults.selectors[ ROLES.AGENDAMODERATOR ] = '.js_role_agenda_moderator';
defaults.selectors[ ROLES.AGENDAADMIN ] = '.js_role_agenda_admin';

if ( [ 'tpl', 'development' ].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}

window.hook( function( options ) {

  adminControls.init();

  hours( utils.extend( {}, options, {
    selectors: {
      origin: '.js_timings_canvas',
      destination: '.js_hours',
      right: '.js_right',
      left: '.js_left',
      months: '.js_months'
    }
  } ) );

} );

window.asap( options => {

  var params = utils.extend( {
    agendaUid: null,
    moderatorCanPublish: false,
    hasCustomFields: false,
    hasOwnershipTransfer: false,
    res: {
      detailedSession: '/session?detailed=1'
    }
  }, defaults, options );

  log = debug( 'event' );

  if ( window.env === 'tpl' ) {

    params.res.detailedSession = 'detailedsession.json';

  }


  _defineRoles( params, ( err, roles ) => {

    log( 'roles: [%s]', roles.join( ',' ) );

    let showControls = adminControls( session, {
      testFunc: function() { return roles.length; },
      displaySelectors: roles.map( r => params.selectors[ r ] )
    } );

    var prv = privateData();


    if ( params.moderatorCanPublish ) {

      du.addClass( du.el( '.js_moderator_can_publish' ), 'js_role_agenda_moderator' );

    }

    displayReferences( params.agendaUid, params.uid );

    if ( params.hasOwnershipTransfer ) {

      ownershipTransfer( {
        lang: params.lang
      } );

    }

    // ugly hack to display state if state control is not presented
    if ( !roles.some( r => r == ROLES.AGENDAMODERATOR || r == ROLES.AGENDAADMIN ) ) {

      du.removeClass( du.el( '.js_current_state' ), 'display-none' );

    }

    if ( roles.length && params.hasCustomFields ) {

      prv.load( params.agendaUid, params.uid, params.lang );

    }

    if ( roles.includes( ROLES.EVENTEDITOR ) ) {

      prv.activities( params.agendaUid, params.uid, params.lang );

    }

    const user = session.getUser();

    if ( user ) {

      prv.inbox( params, { roles, ROLES } );

    }

  } );

  eventMap();

});


function _defineRoles( params, cb ) {

  let roles = [], user;

  if ( !session.isLogged() ) return cb( null, roles );

  user = session.getUser();

  // user is owner
  if ( user.uid == params.ownerUid ) {

    roles.push( ROLES.EVENTEDITOR );

  }

  get( params.res.detailedSession, ( err, res ) => {

    if ( err ) return cb( err );

    if ( params.adminAgendaUids

      .filter( uid => res.agendas.map( a => a.uid ).indexOf( uid ) !== -1 )

      .map( uid => res.agendas.filter( a => a.uid === uid )[ 0 ].role )

      .filter( r => [ 'administrator', 'moderator' ].indexOf( r ) !== -1 )

      .length ) {

      roles.push( ROLES.EVENTEDITOR );

    }

    if ( !params.agendaUid ) return cb( null, roles );

    let matches = res.agendas.filter( a => a.uid === params.agendaUid );

    if ( !matches.length ) return cb( null, roles );

    if ( matches.filter( a => a.role === 'administrator' ).length ) {

      roles.push( ROLES.AGENDAADMIN );

    }

    if ( matches.filter( a => a.role === 'moderator' ).length ) {

      roles.push( ROLES.AGENDAMODERATOR );

    }

    cb( null, roles );

  } )

}
