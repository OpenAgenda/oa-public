"use strict";

const ih = require( 'immutability-helper' );
const Service = require( '@openagenda/members' );
const sessions = require( '@openagenda/sessions' );

const cmn = require( '../../lib/commons-app' );

const interfaces = {
  getEventCountByUserUid: require( './getEventCountByUserUid' ),
  getUsersByUid: require( './getUsersByUid' )
}

const members = {};

module.exports = parentApp => {

  parentApp.use(
    '/:agendaSlug/admin/members.json',
    sessions.middleware.ifUnlogged( ( req, res ) => res.status( 403 ).json( {
      message: 'A session must be opened to access this route'
    } ) ),
    cmn.loadAgendaBy( { slug: 'agendaSlug' } ),
    cmn.authorize.administrator,
    async ( req, res, next ) => {

      res.json( await members.list( ih( req.query, {
        agendaUid: { $set: req.agenda.uid }
      } ), Object.assign( {}, req.query, { order: 'actionsCounter.desc' } ), {
        legacy: true,
        detailed: true,
        total: true
      } ) );

    }
  );

};

module.exports.init = config => {

  Object.assign( members, Service( {
    knex: config.knex,
    schema: 'reviewer',
    interfaces
  } ) );

  Object.assign( module.exports, members );

}
