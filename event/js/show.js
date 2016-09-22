"use strict";

var eventMap = require( './map' ),

utils = require( 'utils' ),

du = require( 'dom-utils' ),

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

if ( [ 'tpl', 'dev' ].indexOf( window.env ) !== -1 ) {

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

window.asap( function( options ) {

  var params = utils.extend( {
    hasCustomFields: false,
    hasOwnershipTransfer: false
  }, defaults, options );

  log = debug( 'event' );

  window.getSession( function( session ) {

    var roles = _defineRoles( params, session ),

    showControls;

    if ( params.hasCustomFields ) {

      adminControls.ifAdmin( function() {

        log( 'user is admin' );

        privateData().load( params.agendaUid, params.uid );

      } );

    }

    displayReferences( params.agendaUid, params.uid );

    if ( params.hasOwnershipTransfer ) {

      ownershipTransfer( {
        lang: params.lang
      } );

    }

    showControls = adminControls( session, {
      testFunc: function() { return roles.length; },
      displaySelectors: roles.map( function( r ) { return params.selectors[ r ]; } )
    } );


    // ugly hack to display state if state control is not presented
    if ( !roles.filter( r => r == ROLES.AGENDAMODERATOR || r == ROLES.AGENDAADMIN ).length ) {

      du.removeClass( du.el( '.js_current_state' ), 'display-none' );

    }


  });
  
  eventMap();

});


function _defineRoles( params, session ) {

  var roles = [];

  if ( !session.logged ) return roles;

  // user is owner
  if ( session.uid == params.ownerUid ) {

    roles.push( ROLES.EVENTEDITOR );

  } else if ( params.adminAgendaUids.filter( function( uid ) {

    return session.reviews.admUids.concat( session.reviews.modUids ).indexOf( uid + '' ) !== -1;

  }).length ) {

    // user is moderator / admin of agenda having
    // edition rights over event
    
    roles.push( ROLES.EVENTEDITOR );

  }

  if ( params.agendaUid && session.reviews.admUids.indexOf( params.agendaUid + '' ) !== -1 ) {

    roles.push( ROLES.AGENDAADMIN );

  }

  if ( params.agendaUid && session.reviews.modUids.indexOf( params.agendaUid + '' ) !== -1 ) {

    roles.push( ROLES.AGENDAMODERATOR );

  }

  log( 'roles: [%s]', roles.join( ',' ) );

  return roles;

}