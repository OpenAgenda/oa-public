"use strict";

const _ = require( 'lodash' );
const sessions = require( '@openagenda/sessions' );
const agendasSvc = require( '@openagenda/agendas' );
const mw = require( '@openagenda/admin-agendas' ).mw;
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );

const preMw = [
  cmn.loadBaseData( 'compiledAdmin.css' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
  cmn.requireAdmin
];


module.exports = app => {

  app.get( '/admin/agendas/', preMw, index );
  app.get( '/admin/agendas/search', preMw, mw.agendas.list );
  app.get( '/admin/agendas/get', preMw, mw.agendas.get );

  app.post(
    '/admin/agendas/:uid',
    preMw,
    ( req, res, next ) => {
      req.context = { user: req.user };
      next();
    },
    agendasSvc.middleware.load( {
      private: null,
      internal: true,
      namespaces: {
        identifiers: {
          uid: 'params.uid'
        }
      }
    } ),
    async ( req, res, next ) => {
      try {
        if ( _.get( req, 'body.credentials.aggregator' ) ) {
          const hasAggregator = await config.knex( config.schemas.aggregator )
            .select( 'id' )
            .where( 'review_id', req.agenda.id )
            .limit( 1 );

          if ( !hasAggregator.length ) {
            await config.knex( config.schemas.aggregator )
              .insert( {
                review_id: req.agenda.id,
                created_at: new Date(),
                updated_at: new Date()
              } )
          }
        }

        next();
      } catch ( e ) {
        next( e );
      }
    },
    mw.agendas.set
  );

  app.get(
    '/admin/agendas/stakeholders/search',
    preMw,
    ( req, res, next ) => {

      req.query.agendaId = req.query.agendaId ? parseInt( req.query.agendaId ) : null;

      req.query.order = 'credential';

      next();

    },
    mw.stakeholders.list
  );

};


function index( req, res ) {

  cmn.render( req, res, 'admin/agendas', req.templateData );

}
