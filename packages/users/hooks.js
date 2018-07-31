"use strict";

const { inspect } = require( 'util' );
const _ = require( 'lodash' );
const errors = require( '@feathersjs/errors' );
const {
  iff,
  some,
  keep,
  discardQuery,
  existsByDot,
  fastJoin,
  paramsFromClient,
  disallow,
  setNow,
  isProvider
} = require( 'feathers-hooks-common' );
const log = require( '@openagenda/logs' )( 'users/hooks' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const {
  actionFromClient,
  callInterface,
  camelCase,
  camelCaseQuery,
  changeEmailFromStore,
  checkUnicity,
  coerce,
  compareFields,
  dataExists,
  detailedParamHook,
  formatStore,
  generateApiKey,
  generateToken,
  generateHash,
  generateUid,
  hashPassword,
  includeImagePathParamHook,
  isAction,
  isValidToken,
  parseStore,
  removedParamHook,
  searchByKey,
  searchKeyword,
  setInStore,
  snakeCase,
  snakeCaseQuery,
  softDelete: _softDelete,
  stashBefore,
  validate,
  verifyPassword
} = require( './hooks/index' );
const fields = require( './utils/fields' );
const config = require( './config' );

schema.register( {
  text: validators.text,
  email: validators.email,
  boolean: validators.boolean,
  pass: validators.pass,
} );

const creationSchema = {
  fullName: {
    type: 'text',
    min: 2
  },
  username: {
    type: 'text'
  },
  culture: {
    type: 'text',
    min: 2,
    max: 2
  },
  email: {
    type: 'email',
    optional: false
  },
  password: {
    type: 'text',
    min: 4,
    optional: false
  }
};

const softDelete = () => _softDelete( 'isRemoved', { provider: undefined, detailed: true, includeImagePath: false } );

const userResolvers = {
  joins: {
    apiKey: () => async user => {
      if ( !user ) {
        return;
      }

      const result = await config.interfaces.keys.get( {
        type: 'userPublic',
        identifier: user.uid
      } );

      user.apiKey = result ? result.key : null;
    },
    apiSecret: () => async user => {
      if ( !user ) {
        return;
      }

      const result = await config.interfaces.keys.get( {
        type: 'userPrivate',
        identifier: user.uid
      } );

      user.apiSecret = result ? result.key : null;
    }
  }
};


module.exports = {
  before: {
    all: [],
    find: [
      paramsFromClient( 'detailed', 'removed', 'includeImagePath' ),
      removedParamHook(),
      detailedParamHook(),
      softDelete(),
      snakeCaseQuery(),
      searchByKey(),
      searchKeyword()
    ],
    get: [
      stashBefore( 'before', { internal: true, provider: undefined } ),
      paramsFromClient( 'detailed', 'removed', 'includeImagePath' ),
      removedParamHook(),
      detailedParamHook(),
      softDelete(),
      snakeCaseQuery()
    ],
    create: [
      paramsFromClient( 'detailed', 'removed', 'includeImagePath' ),
      context => validate( {
        ...creationSchema,
        // Allow server to create an activated user
        ...(isProvider( 'server' )( context ) ? {
          isActivated: {
            type: 'boolean',
            default: false
          }
        } : {}),
        // Allow password to be optional for a twitter registration
        ...(context.data.twitterId ? {
          password: {
            type: 'text',
            min: 4,
            optional: true
          }
        } : {})
      } )( context ),
      checkUnicity( 'email' ),
      generateUid(),
      iff(
        context => existsByDot( context.data, 'password' ),
        generateHash( 'salt' ),
        hashPassword( 'data.password', 'data.salt' )
      ),
      setNow('createdAt', 'updatedAt'),
      callInterface( 'beforeCreate' ),
      formatStore(),
      softDelete(),
      snakeCase(),
      snakeCaseQuery()
    ],
    update: [
      disallow()
    ],
    patch: [
      stashBefore( 'before', { internal: true, provider: undefined } ),
      actionFromClient(),
      iff(
        some( isAction( 'setImageProfile' ), isAction( 'clearImageProfile' ) ),
        keep( 'image' )
      ),
      iff(
        isAction( 'requestChangeEmail' ),
        validate( {
          newEmail: {
            optional: false,
            type: 'email'
          },
          password: {
            type: 'text'
          }
        } ),
        checkUnicity( 'email', 'data.newEmail' ),
        iff(
          isProvider( 'external' ),
          verifyPassword()
        ),
        generateToken( 'newEmailToken' ),
        setInStore( 'newEmailToken', 'newEmailToken' ),
        setInStore( 'newEmail', 'data.newEmail' ),
        keep( 'store' )
      ),
      iff(
        isAction( 'confirmChangeEmail' ),
        isValidToken( 'params.before.store.newEmailToken', 'params.query.token' ),
        checkUnicity( 'email', 'params.before.store.newEmail' ),
        changeEmailFromStore(),
        discardQuery( 'token' ),
        keep( 'email', 'store' )
      ),
      iff(
        isAction( 'changePassword' ),
        validate( {
          password: {
            optional: false,
            type: 'text',
            min: 4
          },
          confirmation: {
            type: 'text'
          },
          oldPassword: {
            type: 'text'
          }
        } ),
        iff(
          isProvider( 'external' ),
          verifyPassword( 'oldPassword' ),
          compareFields( 'password', 'confirmation' )
        ),
        hashPassword( 'data.password', 'params.before.salt' ),
        keep( 'password' )
      ),
      iff(
        isAction( 'generateApiKey' ),
        paramsFromClient( 'detailed', 'removed', 'publicKey', 'secretKey', 'includeImagePath' ),
        generateApiKey(),
        keep()
      ),
      iff(
        isAction( 'setNewFlag' ),
        validate( {
          isNew: {
            optional: false,
            type: 'boolean'
          }
        } ),
        keep( 'isNew' )
      ),
      iff(
        isAction( 'refresh' ),
        iff( dataExists( 'lastSignin' ), setNow( 'lastSignin' ) ),
        iff( dataExists( 'lastInboxCheck' ), setNow( 'lastInboxCheck' ) ),
        iff( dataExists( 'lastNotified' ), setNow( 'lastNotified' ) ),
        keep( 'lastSignin', 'lastInboxCheck', 'lastNotified' )
      ),
      // If there are not action you can modify your profile
      iff(
        isAction( undefined ),
        iff(
          context => context.params.internal !== true,
          context => validate( _.pick( {
            fullName: {
              optional: true,
              type: 'text'
            },
            culture: {
              optional: true,
              type: 'text',
              min: 2,
              max: 2
            },
            isRemoved: {
              optional: true,
              type: 'boolean'
            }
          }, Object.keys( context.data ) ) )( context ),
          keep( 'fullName', 'culture', 'isRemoved' )
        )
      ),
      setNow( 'updatedAt' ),
      paramsFromClient( 'detailed', 'removed', 'includeImagePath' ),
      softDelete(),
      formatStore(),
      snakeCase(),
      snakeCaseQuery()
    ],
    remove: [
      stashBefore(),
      callInterface( 'beforeRemove' ),
      paramsFromClient( 'detailed', 'removed', 'includeImagePath' ),
      softDelete(),
      snakeCase(),
      snakeCaseQuery(),
    ],
  },

  after: {
    all: [
      camelCase(),
      camelCaseQuery(),
      iff(
        context => (context.result !== null && context.params.internal !== true),
        context => keep(
          ...(context.params.detailed ? [ ...fields.basic, ...fields.detailed ] : fields.basic)
        )( context )
      ),
      context => {
        if ( context.result === null || context.params.internal === true ) {
          return context;
        }

        keep(
          ...(context.params.detailed ? [ ...fields.basic, ...fields.detailed ] : fields.basic)
        )( context );
      },
      includeImagePathParamHook(),
      coerce( {
        isActivated: {
          type: 'boolean',
          optional: true
        },
        isRemoved: {
          type: 'boolean',
          optional: true
        },
        isBasic: {
          type: 'boolean',
          optional: true
        },
        isNew: {
          type: 'boolean',
          optional: true
        },
        apiKey: {
          type: 'text',
          optional: true
        },
        apiSecret: {
          type: 'text',
          optional: true
        }
      } ),
      fastJoin( userResolvers ),
      parseStore()
    ],
    find: [],
    get: [],
    create: [
      async context => {
        if ( context.result && !context.result.isActivated ) {
          const tokensSvc = context.app.service( `${context.path}/tokens` );
          const token = await tokensSvc.create( {
            type: 'activateAccount',
            userId: context.result.id,
            email: context.result.email
          }, {
            optionals: context.params.tokenOptionals,
            user: context.result
          } );

          context.params.activationToken = token;
        }
      },
      callInterface( 'onCreate' ),
      iff(
        context => (context.result && context.result.isActivated),
        callInterface( 'onActivation' )
      )
    ],
    update: [],
    patch: [
      iff(
        isAction( 'generateApiKey' ),
        callInterface( 'onGenerateApiKey' )
      ),
      iff(
        context => (!context.params.before.isActivated && context.result.isActivated),
        callInterface( 'onActivation' )
      )
    ],
    remove: []
  },

  error( context ) {
    // Avoid soft delete error
    if ( context.error instanceof errors.NotFound && context.error.message.includes( 'Item not found' ) ) {
      context.error = null;
      context.result = null;
      return context;
    }

    if ( !context.error instanceof errors.NotFound ) {
      log.error(
        `Error in '${context.path}' service method '${context.method}'\n${context.error.stack}\n`,
        inspect( _.omit( context.error, [ 'hook.app', 'hook.service' ] ), { colors: true } )
      );
    }
  }
};
