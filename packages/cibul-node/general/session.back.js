"use strict";

const sessions = require( '@openagenda/sessions' );
const agendas = require( '@openagenda/agendas' );

const cmn = require( '../lib/commons-app' );
const members = require( '../services/members' );

module.exports = app => {
  app.get(
    '/session',
    sessions.middleware.ifUnlogged( ( req, res ) => res.send( null ) ),
    ( req, res, next ) => { req.query.detailed ? _loadDetailed( req, res, next ) : next() },
    ( req, res ) => res.send( req.user )
  );

  app.get(
    '/session/agendas/:agendaUid/role',
    agendaLoad,
    role
  );
};


// agendas service middleware will replace this
// middleware from service/agenda/middleware
function agendaLoad(req, res, next) {
  agendas.get({
    uid: req.params.agendaUid
  }, {
    internal: true,
    private: null
  }, ( err, agenda ) => {
    if ( err ) return next( err );
    req.agendaRef = agenda;
    next();
  });
}


function role( req, res, next ) {
  if (!req.agendaRef || !req.user) {
    return res.send( null );
  }
  members.get({
    agendaUid: req.agendaRef.uid,
    userUid: req.user.uid
  }).then( member => {
    res.send( member ? members.utils.getRoleSlug( member.role ) : null );
  });
}

// retrieve additional stuff related to current user session
function _loadDetailed(req, res, next) {
  sessions.get( req, {detailed: true}, (err, session) => {
    members.list({
      userUid: req.user.uid,
    }, {
      limit: 1000
    }, {
      detailed: true
    }).then(memberRefs => {
      req.user.agendas = memberRefs
        .filter(member => member.agenda)
        .map(member => ({
          uid: member.agenda.uid,
          title: member.agenda.title,
          role: members.utils.getRoleSlug( member.role )
        }));
      next();
    } );
  } );
}
