"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const w = require( 'when' );

const members = require( '../services/members' );
const cbify = require( '@openagenda/utils/cbify' );
const sessions = require( '@openagenda/sessions' );
const keysSvc = require( '@openagenda/keys' );
const agendaDocx = require( '@openagenda/agenda-docx' );
const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );
const model = require( '../services/model' );

module.exports = app => {
  app.get(
    '/:slug/actions',
    agendaSvc.mw.load( 'slug' ),
    ( req, res, next ) => {
      req.params.sourceAgendaUid = req.query.sourceAgendaUid;
      next();
    },
    agendaSvc.mw.load( 'sourceAgendaUid', 'uid', { name: 'sourceAgenda', required: false, basicLoad: true } ),
    loadKey(),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    _loadDocxPath,
    actionShow
  );
};


function loadKey() {

  return cbify( async ( req, res, next ) => {

    if ( req.user ) {

      try {

        req.userKey = await keysSvc( { identifier: req.user.uid, type: 'userPublic' } ).get();

      } catch ( e ) {

        req.log( 'user public key not found for user', req.user.uid || req.user, 'error:', e );

      }

    }

    next();

  } );

}


function _loadDocxPath( req, res, next ) {

  agendaDocx.getState( req.agenda.uid ).then( state => {

    req.docxPath = _.get( state, 'file.path' );

    next();

  }, next );

}


/**
 * controllers
 */

function actionShow( req, res ) {

  w( {
    agenda: {
      title: req.agenda.getTitle(),
      description: req.agenda.getDescription(),
      slug: req.agenda.slug,
      uid: req.agenda.uid,
      image: req.agenda.getImage(),
      private: req.agenda.private
    },
    key: req.userKey ? req.userKey.key : undefined,
    hasAggregator: false,
    docxPath: req.docxPath,
    agendas: [],
    xhr: req.xhr,
    includeActionLinks: false,
    scriptParams: {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      lang: req.lang,
      languages: []
    },
    search: req.query.oaq,
    logged: false
  } )

  .then( v => {

    return new Promise( ( rs, rj ) => {

      req.agenda.getLanguages( ( err, languages ) => {

        if ( err ) return rj( err );

        v.scriptParams.languages = languages;

        rs( v );

      } );

    } );

  } )

  .then( function( values ) {

    return sessions.isLogged( req ).then( is => {

      values.logged = is;

      if ( !is ) {

        return values;

      }

      return w.promise( ( rs, rj ) => {

        values.agendas = [];
        values.redirect = encodeURIComponent(req.originalUrl);

        var aIds = [];

        // list agendas which have the aggregator feature and of which user is admin

        async.each( [
          { aggregator: true, adminId: req.user.id, limit: false },
          { aggregator: true, ownerId: req.user.id, limit: false }
        ], ( query, ecb ) => {

          model.reviews().list( query, ( err, agendas ) => {

            if ( err ) return rj( err );

            agendas.forEach( ( a ) => {

              if ( a.id == req.agenda.id ) return;

              if ( aIds.indexOf( a.id ) !== -1 ) return;

              aIds.push( a.id );

              values.agendas.push( {
                id: a.id,
                title: a.title,
                aggUid: a.uid,
                slug: a.slug,
                aggregates: false
              } );

            } );

            ecb();

          } );

        }, ( err, result ) => {

          if ( err ) return rj( err );

          if ( values.agendas.length ) values.hasAggregator = true;

          rs( values );

        } );

      } );

    } );

  })

  .then( function( values ) {

    if ( !values.logged ) return values;

    return w.promise( ( rs, rj ) => {

      req.agenda.getAggregators( function( err, result ) {

        var aggAgendasIds = result.map( function( a ) {

          return a.id;

        });

        values.agendas.map( function( a ) {

          if ( aggAgendasIds.indexOf( a.id ) !== -1 ) {

            a.aggregates = true;

          }

          return a;

        });

        rs( values );

      })

    });

  } )

  .done( function( values ) {

    var renderParams = [ req, res, 'agenda/action', values ];

    if ( req.xhr ) {

      cmn.render.apply( null, renderParams );

    } else {

      cmn.loadBaseData( 'oa.css' )( req, res, async function() {

        req.baseData.indexed = _.get(
          await req.app.services.agendas.get({ uid: req.agenda.uid }),
          'indexed',
          true
        );

        cmn.render.apply( null, renderParams );

      } );

    }

  }, cmn.catchError( req, res ) );

}



