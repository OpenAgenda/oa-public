"use strict";

const sessions = require( '@openagenda/sessions' );
const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );
const eventSvc = require( '../services/event' );

const l = {
  a: require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/actions' ) ),
  e: require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/errors' ) ),
  s: require( '@openagenda/labels' )( require( '@openagenda/labels/event/states' ) )
};


module.exports = app => {

  app.post(
    '/agendas/:uid/admin/events/states',
    cmn.loadLogger( 'group actions' ),
    agendaSvc.mw.load( 'uid' ),
    cmn.checkAdminOrModerator,
    agendaSvc.mw.load( 'uid' ),
    changeStates
  );

};

function changeStates( req, res, next ) {

  let redirectRes = req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ),

  labels = {},

  stateSwitch;

  labels[ eventSvc.STATETYPES.NOTVALIDATED ] = 'tobecontrolled';
  labels[ eventSvc.STATETYPES.VALIDATED ] = 'controlled';
  labels[ eventSvc.STATETYPES.PUBLISHED ] = 'published';

  if ( !req.body.state.length ) {

    sessions.setFlash( req, res, l.e( 'selectActionBefore', req.lang ) );

    res.redirect( 302, redirectRes );

    return;

  }

  stateSwitch = {
    readytopublished: [ eventSvc.STATETYPES.VALIDATED, eventSvc.STATETYPES.PUBLISHED ],
    publishedtoready: [ eventSvc.STATETYPES.PUBLISHED, eventSvc.STATETYPES.VALIDATED ],
    tocontroltoready: [ eventSvc.STATETYPES.NOTVALIDATED, eventSvc.STATETYPES.VALIDATED ],
    readytotocontrol: [ eventSvc.STATETYPES.VALIDATED, eventSvc.STATETYPES.NOTVALIDATED ]
  }[ req.body.state ];

  if ( !stateSwitch ) {

    sessions.setFlash( req, res, l.e( 'unknownAction', req.lang ) );

    return res.redirect( 302, redirectRes );

  }

  req.agenda.changeEventStates( stateSwitch[ 0 ], stateSwitch[ 1 ], {
    context: {
      userUid: req.user.uid,
      agendaUid: req.agenda.uid,
      batched: true
    }
  }, err => {

    if ( err ) return next( err );

    req.log( 'info', 'changing state of agenda events from %s to %s', labels[ stateSwitch[ 0 ] ], labels[ stateSwitch[ 1 ] ] );

    sessions.setFlash( req, res, l.a( 'actionsInProcess', {
      oldstate : '<strong>' + l.s( labels[ stateSwitch[ 0 ] ], req.lang ) + '</strong>',
      newstate : '<strong>' + l.s( labels[ stateSwitch[ 1 ] ], req.lang ) + '</strong>'
    }, req.lang ) );

    res.redirect( 302, redirectRes );

  } );

}
