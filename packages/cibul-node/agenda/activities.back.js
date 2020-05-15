"use strict";

const React = require( 'react' );
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const cmn = require( '../lib/commons-app' );
const members = require('../services/members');

const preMw = [
  cmn.loadLogger( 'agendaActivities' ),
  sessions.mw.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
  cmn.loadAgenda,
  members.mw.loadAndAuthorize('moderator')
];


module.exports = app => {
  app.get(
    '/:slug/admin/activities/list',
    preMw,
    ( req, res ) => mw.list( { entityType: 'agenda', entityUid: req.agenda.uid } )( req, res )
  );
};
