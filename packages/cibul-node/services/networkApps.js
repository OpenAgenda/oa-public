"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const NetworkApps = require( '@openagenda/network-apps' );
const sessions = require( '@openagenda/sessions' );
const eventFormSchema = require( '@openagenda/event-form/src/schema' );

const log = require( '@openagenda/logs' )( 'services/networkApps' );

const cmn = require( '../lib/commons-app' );
const core = require( '../core' );

const layout = require( './lib/layouts' ).load( 'main', {
  title: 'Admin des réseaux'
} );

const router = NetworkApps.router;

module.exports = parentApp => {

  parentApp.use( '/dist/networkApps',
    router.dist,
    ( req, res, next ) => res.send( 404 )
  );

  parentApp.use( '/admin/networks',
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
    cmn.requireSuperAdmin,
    router
  );

}

module.exports.init = config => {

  router.setLayout( layout );

  router.setService( NetworkApps( {
    CDNPath: config.aws.servicesBucketPath,
    frontAppPath: process.env.NODE_ENV !== 'production' ? '/dist/networkApps' : null,
    interfaces: {
      getEventSchema: () => eventFormSchema( { languages: true } ),
      listNetworks: core.networks.list,
      getNetwork: uid => core.networks( uid ).get(),
      getNetworkSchema: uid => core.networks( uid ).schema.get(),
      setNetworkSchemaFields: ( uid, fields ) => core.networks( uid ).schema.updateFields( fields ),
      getNetworkAgendas: uid => core.networks( uid ).agendas(),
      getLoggedUser: async req => req.user,
      addAgendaToNetwork,
      createAgenda,
      createNetwork: core.networks.create
    }
  } ) );


}


async function createAgenda( networkUid, data, user ) {

  return core.networks( networkUid ).agendas.create( {
    ...data,
    ownerId: user.id
  } );

}

async function addAgendaToNetwork( uid, dirtySlug ) {

  const slug = (
    dirtySlug.split( '?' ).shift()
  ).split( '/' ).pop();

  log( 'extracted slug %s', slug );

  const agenda = await agendas.get( { slug }, { private: null } );

  await core.networks( uid ).agendas.add( agenda.uid );

  return agenda;

}
