"use strict";

const _ = require( 'lodash' );

const errors = require( '@feathersjs/errors' );
const users = require( '@openagenda/users' );
const svcHooks = require( '@openagenda/users/hooks' );
const { isAction } = require( '@openagenda/users/hooks/index' );
const keys = require( '@openagenda/keys' );
const agendas = require( '@openagenda/agendas' );
const sessions = require( '@openagenda/sessions' );
const mails = require( '@openagenda/mails' );
const labels = require( '@openagenda/labels/users/settings' );
const getLabels = require( '@openagenda/labels/makeLabelGetter' )( labels );
const { iff, isProvider, disallow } = require( 'feathers-hooks-common' );
const update = require( 'immutability-helper' );
const beforeCreate = require( './beforeCreate' );
const beforeRemove = require( './beforeRemove' );
const onCreate = require( './onCreate' );
const onGenerateApiKey = require( './onGenerateApiKey' );
const onActivation = require( './onActivation' );
const sendToken = require( './sendToken' );

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

const hooks = update( svcHooks, {
  before: {
    create: {
      $unshift: [
        iff(
          isProvider( 'external' ),
          restrictToUnlogged()
        )
      ]
    },
    get: {
      $unshift: [
        iff(
          isProvider( 'external' ),
          restrictToCurrentUser()
        )
      ]
    },
    find: {
      $unshift: [
        disallow( 'external' )
      ]
    },
    update: {
      $set: disallow()
    },
    patch: {
      $unshift: [
        iff( // restrictToCurrentUser expect for confirmChangeEmail
          context => isProvider( 'external' )( context ) && !isAction( 'confirmChangeEmail' )( context ),
          restrictToCurrentUser(),
        )
      ]
    },
    remove: {
      $unshift: [
        iff(
          isProvider( 'external' ),
          restrictToCurrentUser()
        )
      ]
    }
  }
} );

module.exports = app => {

  const { app: userApp, exposeApp } = users;

  userApp.use( ( req, res, next ) => {

    req.feathers.user = req.user;
    req.feathers.authenticated = req.authenticated = !!req.user;

    next();

  } );

  // transform uid 'me' to the uid of the current user
  userApp.param( '__feathersId', ( req, res, next, uid ) => {
    if ( uid !== 'me' ) {
      return next();
    }

    if ( !req.user || !req.user.uid ) {
      return next( new errors.NotAuthenticated( 'You should be logged' ) );
    }

    req.params.__feathersId = req.user.uid;

    next();
  } );

  exposeApp( app, '/users' );
  users.hooks( hooks );

  // update session after a user patch
  userApp.patch(
    '/users/:__feathersId',
    sessions.middleware.open( 'user', 'sessionResult' ),
    ( req, res, next ) => {
      if ( !res.data ) {
        return next();
      }

      sessions.middleware.sync( 'syncResult' )( req, res, next );
    }
  );

  // send confirmation email after requestChangeEmail
  userApp.patch(
    '/users/:__feathersId/requestChangeEmail',
    ( req, res, next ) => {
      if ( res.data ) {

        users.get( res.data.uid, { internal: true } )
          .then( user => {

            const email = user.store && user.store.newEmail;
            const token = user.store && user.store.newEmailToken;

            if ( !token ) return next();

            const link = `${config.root}/users/${user.uid}/confirmChangeEmail?token=${token}`;

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
  userApp.get(
    '/users/:__feathersId/confirmChangeEmail',
    ( req, res, next ) => {
      if ( res.data ) {
        sessions.setFlash(
          req,
          res,
          getLabels( res.data ? 'changeEmailSuccess' : 'changeEmailFail', req.lang )
        );

        return res.redirect( '/home' );
      }

      next();
    }
  );

  // set flash & redirect message after account deletion
  userApp.delete(
    '/users/:__feathersId',
    ( req, res, next ) => {
      if ( res.data ) {
        sessions.setFlash( req, res, getLabels( 'accountRemoved', req.lang ) );
      }

      next();
    }
  );

};

module.exports.init = async config => {

  await users.init( {
    paginate: {
      default: 20,
      max: 100
    },
    knex: config.knex,
    mysql: config.db,
    schemas: _.pick( config.schemas, [
      // explicit list schemas used by service
      'user', 'apiKeySet', 'unsubscribed', 'key', 'userToken'
    ] ),
    imagePath: config.aws.imageBucketPath,
    files: {
      bucket: config.aws.bucket,
      accessKeyId: config.aws.accessKeyId, // required
      secretAccessKey: config.aws.secretAccessKey,
      tmpPath: config.tmpFolderPath
    },
    interfaces: {
      beforeRemove,
      beforeCreate,
      onCreate,
      onGenerateApiKey,
      onActivation,
      sendToken: sendToken.bind( null, config ),
      getAgenda: ( agendaUid, cb ) => agendas.get( { uid: agendaUid }, cb ),
      keys: {
        get: identifiers => keys( identifiers ).get(),
        create: ( identifiers, data ) => keys( identifiers ).create( data ),
        remove: identifiers => keys( identifiers ).remove()
      }
    },
    logger: config.getLogConfig( 'svc', 'users', false )
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
