"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const errors = require( '@feathersjs/errors' );
const users = require( '@openagenda/users' );
const svcHooks = require( '@openagenda/users/hooks' );
const { isAction } = require( '@openagenda/users/hooks/index' );
const logger = require( '@openagenda/logger' );
const keys = require( '@openagenda/keys' );
const agendas = require( '@openagenda/agendas' );
const sessions = require( '@openagenda/sessions' );
const mails = require( '@openagenda/mails' );
const mailer = require( '@openagenda/mailer' );
const labels = require( '@openagenda/labels/users/settings' );
const getLabels = require( '@openagenda/labels/makeLabelGetter' )( labels );
const { iff, isProvider, disallow } = require( 'feathers-hooks-common' );
const beforeRemove = require( './beforeRemove' );
const onCreate = require( './onCreate' );
const onGenerateApiKey = require( './onGenerateApiKey' );

function restrictToCurrentUser() {
  return context => {
    if ( !context.params.user ) {
      throw new errors.NotAuthenticated( 'You are not authenticated.' );
    }

    if ( context.params.user.uid === undefined ) {
      throw new errors.Forbidden( 'uid is missing from current user.' );
    }

    if ( context.params.user.uid !== context.id ) {
      throw new errors.Forbidden( 'You do not have the permissions to access this.' );
    }
  };
}

function restrictToUnlogged() {
  return context => {
    if ( context.params.user ) {
      throw new errors.Forbidden( `You must not be logged in.` );
    }
  };
}

const hooks = {
  before: {
    all: svcHooks.before.all,
    create: [
      iff(
        isProvider( 'external' ),
        restrictToUnlogged()
      ),
      ...svcHooks.before.create
    ],
    get: [
      iff(
        isProvider( 'external' ),
        restrictToCurrentUser()
      ),
      ...svcHooks.before.get
    ],
    find: [
      disallow( 'external' ),
      ...svcHooks.before.find
    ],
    update: disallow(),
    patch: [
      iff( // restrictToCurrentUser expect for confirmChangeEmail
        ctx => isProvider( 'external' )( ctx ) && !isAction( 'confirmChangeEmail' )( ctx ),
        restrictToCurrentUser(),
      ),
      ...svcHooks.before.patch
    ],
    remove: [
      iff(
        isProvider( 'external' ),
        restrictToCurrentUser()
      ),
      ...svcHooks.before.remove
    ]
  },
  after: svcHooks.after,
  error: svcHooks.error,
};

module.exports = ( parentApp, mountpath ) => {

  const { app, exposeApp } = users;

  app.use( sessions.middleware.load( { detailed: true } ) );

  app.use( ( req, res, next ) => {

    req.feathers.user = req.user;
    req.feathers.authenticated = req.authenticated = !!req.user;

    next();

  } );

  // transform uid 'me' to the uid of the current user
  app.param( '__feathersId', ( req, res, next, uid ) => {
    if ( uid !== 'me' ) {
      return next();
    }

    if ( !req.user || !req.user.uid ) {
      return next( new errors.NotAuthenticated( 'You should be logged' ) );
    }

    req.params.__feathersId = req.user.uid;

    next();
  } );

  exposeApp( parentApp, mountpath );
  users.hooks( hooks );

  // update session after a user patch
  app.patch(
    path.join( mountpath, '/:__feathersId' ),
    ( req, res, next ) => {
      return _.flow(
        sessions.middleware.open( 'user', 'sessionResult' ),
        res.data ? sessions.middleware.sync( 'syncResult' ) : ( req, res, next ) => next(),
      )( req, req, next );
    }
  );

  // send confirmation email after requestChangeEmail
  app.patch(
    path.join( mountpath, '/:__feathersId/requestChangeEmail' ),
    ( req, res, next ) => {
      if ( res.data ) {

        users.get( res.data.uid, { internal: true } )
          .then( user => {

            const email = user.store && user.store.newEmail;
            const token = user.store && user.store.newEmailToken;

            if ( !token ) return next();

            const link = req.genUrl( 'confirmChangeEmail', {
              uid: user.uid,
              token
            }, { protocol: 'https://' } );

            sendEmailForChange( {
              user,
              email,
              link,
              lang: req.lang
            } );

            next();

          } )
          .catch( next );

      }

    }
  );

  // set flash message after confirm change of email
  app.get(
    path.join( mountpath, '/:__feathersId/confirmChangeEmail' ),
    ( req, res, next ) => {
      if ( res.data ) {
        sessions.setFlash(
          req,
          res,
          getLabels( res.data ? 'changeEmailSuccess' : 'changeEmailFail', req.lang )
        );

        return res.redirect( req.genUrl( 'homeShow' ) );
      }

      next();
    }
  );

  // set flash & redirect message after account deletion
  app.delete(
    path.join( mountpath, '/:__feathersId' ),
    ( req, res, next ) => {
      if ( res.data ) {
        sessions.setFlash( req, res, getLabels( 'accountRemoved', req.lang ) );
      }

      next();
    }
  );

};

module.exports.init = async function init( config ) {

  await users.init( {
    paginate: {
      default: 20,
      max: 100
    },
    knex: config.knex,
    mysql: config.db,
    schemas: config.schemas,
    files: {
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId, // required
      secretAccessKey: config.aws.secretAccessKey,
      tmpPath: config.tmpFolderPath
    },
    interfaces: {
      beforeRemove,
      onCreate,
      getAgenda: ( agendaUid, cb ) => agendas.get( { uid: agendaUid }, cb ),
      onGenerateApiKey,
      keys: {
        get: identifiers => keys( identifiers ).get(),
        create: ( identifiers, data ) => keys( identifiers ).create( data ),
        remove: identifiers => keys( identifiers ).remove()
      }
    },
    logger
  } );

  users.hooks( hooks );

};

function sendEmailForChange( { user, email, link, lang } ) {

  mails( {
    template: 'changeEmail',
    to: email,
    data: {
      link
    },
    lang
  } );

}
