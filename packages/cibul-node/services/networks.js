"use strict";

const _ = require( 'lodash' );

const networks = require( '@openagenda/networks' );
const NetworkApps = require( '@openagenda/network-apps' );
const sessions = require( '@openagenda/sessions' );
const eventFormSchema = require( '@openagenda/event-form/src/schema' );

const cmn = require( '../lib/commons-app' );

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
      getEventSchema: () => eventFormSchema( { languages: true } )
    }
  } ) );

  _.assign( module.exports, networks( {
    knex: config.knex
  } ) );

}
