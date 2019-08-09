"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const sessions = require( '@openagenda/sessions' );
const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const labels = require( '@openagenda/labels/unsubscription' );
const log = require( '@openagenda/logs' )( 'services/mails/unsubscription' );

const processUnsubscriptionToken = require( './lib/processUnsubscriptionToken' );

const {
  TOKEN_REGEX_STRING,
  TOKEN_REGEX
} = require( './lib/tokenRegex' );

const getLabel = makeLabelGetter( labels );
const app = express();


let config;

module.exports = Object.assign( plugApp, {
  init: c => config = c,
  task
} )

function task() {
  knex( schemas.unsubscriptionLink )
    .delete()
    .where( 'created_at', '<', new Date( new Date().getTime() - (1000 * 60 * 60 * 24 * 90) ) )
    .then(
      () => log.info( 'Old unsubscription links removed successfully' ),
      err => log.error( 'Unable to remove old unsubscription links', err )
    );
}

function plugApp( parentApp, path = '' ) {
  app.use( `/unsubscribe/:token(${TOKEN_REGEX_STRING})`, ( req, res, next ) => {
    const { token } = req.params;

    if ( !token.match( TOKEN_REGEX ) ) {
      res.status( 400 );
      return next( new Error( getLabel( 'tokenMalformed', req.lang ) ) );
    }

    processUnsubscriptionToken( config, token )
      .then( unsubscription => {
        sessions.setFlash(
          req,
          res,
          getLabel(
            unsubscription.target && unsubscription.target.email
              ? 'guestUnsubscriptionSucceed'
              : 'unsubscriptionSucceed',
            req.lang
          )
        );
        res.redirect( 302, req.user ? '/home' : '/' );
      } )
      .catch( err => {
        if ( err.message === 'Unsubscription token already used' ) {
          sessions.setFlash( req, res, getLabel( 'tokenAlreadyUsed', req.lang ) );

          return res.redirect( 302, req.user ? '/home' : '/' );
        }

        if ( err.message === 'Unsubscription token is not found' ) {
          sessions.setFlash( req, res, getLabel( 'tokenNotFound', req.lang ) );

          return res.redirect( 302, req.user ? '/home' : '/' );
        }

        res.status( 400 );
        return next( err );
      } )
  } );

  parentApp.use( path, app );
};
