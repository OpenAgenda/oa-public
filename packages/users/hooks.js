"use strict";

const { inspect } = require( 'util' );
const _ = require( 'lodash' );
const uuid = require( 'uuid/v4' );
const errors = require( '@feathersjs/errors' );
const {
  alterItems,
  iff,
  some,
  keep,
  discardQuery,
  stashBefore,
  fastJoin,
  paramsFromClient,
  validate: validateHook,
  disallow,
  existsByDot,
  setNow
} = require( 'feathers-hooks-common' );
const log = require( '@openagenda/logs' )( 'users/hooks' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const crypto = require( './service/lib/crypto' );
const config = require( './config' );
const softDelete = require( './hooks/softDelete' );

schema.register( {
  text: validators.text,
  email: validators.email,
  boolean: validators.boolean,
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


const isAction = action => context => (context.params || {}).action === action;

const camelCaseQuery = () => context => _.set( context, 'params.query',
  _.mapKeys(
    _.get( context, 'params.query', {} ),
    ( value, key ) => _.startsWith( key, '$' ) ? key : _.camelCase( key )
  )
);
const snakeCaseQuery = () => context => _.set( context, 'params.query',
  _.mapKeys(
    _.get( context, 'params.query', {} ),
    ( value, key ) => _.startsWith( key, '$' ) ? key : _.snakeCase( key )
  )
);
const camelCase = () => alterItems( record => _.mapKeys( record, ( value, key ) => _.camelCase( key ) ) );
const snakeCase = () => alterItems( record => _.mapKeys( record, ( value, key ) => _.snakeCase( key ) ) );
const parseStore = () => alterItems( record =>
  ({ ...record, store: _.isString( record.store ) ? JSON.parse( record.store || '{}' ) : record.store })
);
const formatStore = () => alterItems( record =>
  ({ ...record, store: _.isObject( record.store ) ? JSON.stringify( record.store || {} ) : record.store })
);

const generateUid = () => async context => {
  const uid = Math.ceil( Math.random() * 99999999 );

  const result = await context.service.find( {
    query: {
      uid,
      $limit: 0
    }
  } );

  if ( result.total ) {
    return generateUid()( context );
  } else {
    context.data.uid = uid;
    return context;
  }
};

const generateToken = key => context => {
  _.set( context, key, uuid().replace( /-/g, '' ) );
};

const checkUnicity = ( field, dataKey = `data.${field}` ) => async context => {
  if ( !_.get( context, dataKey ) ) {
    return;
  }

  const result = await context.service.find( {
    query: {
      [ field ]: _.get( context, dataKey ),
      $limit: 0
    }
  } );

  if ( result.total !== 0 ) {
    throw new errors.BadRequest( 'Already exist' );
  }
};

const validate = _schema => {
  const _validate = schema( _schema );

  return context => validateHook( values => {
    try {
      context.data = _validate( values );
    } catch ( e ) {
      return e;
    }
  } )( context );
}

const coerce = _schema => {
  const _coerce = schema( _schema );

  return context => {
    if ( context.result ) {
      Object.assign( context.result, _coerce( context.result ) );
    }
  };
}

const setInStore = ( key, getter = key ) => async context => {
  const value = typeof getter === 'function' ? await getter( context ) : _.get( context, getter );

  context.data.store = _.merge( {}, context.params.before.store, context.data.store, _.set( {}, key, value ) );
};

const isValidToken = ( localKey, foreignKey ) => context => {
  if ( _.get( context, localKey ) !== _.get( context, foreignKey ) ) {
    throw new errors.BadRequest( 'Bad token' );
  }
};

const changeEmailFromStore = () => context => {
  context.data.email = context.params.before.store.newEmail;

  context.data.store = _.merge( {}, context.params.before.store, context.data.store );

  delete context.data.store.newEmail;
  delete context.data.store.newEmailToken;
};

const hashPassword = ( passwordKey, saltKey ) => context => {
  context.data.password = crypto.hashPassword( _.get( context, passwordKey ), _.get( context, saltKey ) );
};

const generateApiKey = () => async context => {
  const { keys } = config.interfaces;
  const { publicKey, secretKey } = context.params;

  async function _generate( type ) {
    await keys.remove( {
      type,
      identifier: context.params.before.uid
    } );

    await keys.create( {
      type,
      identifier: context.params.before.uid
    } );
  }

  if ( publicKey ) await _generate( 'userPublic' );
  if ( secretKey ) await _generate( 'userPrivate' );

  context.result = context.params.before;
};

const userResolvers = {
  joins: {
    apiKey: () => async user => {
      const result = await config.interfaces.keys.get( {
        type: 'userPublic',
        identifier: user.uid
      } );
      user.apiKey = result ? result.key : null;
    },
    apiSecret: () => async user => {
      const result = await config.interfaces.keys.get( {
        type: 'userPrivate',
        identifier: user.uid
      } );
      user.apiSecret = result ? result.key : null;
    }
  }
};

const dataExists = key => context => existsByDot( context.data, key );

module.exports = {
  before: {
    all: [],
    find: [
      softDelete( 'isRemoved' ),
      snakeCaseQuery()
    ],
    get: [
      stashBefore(),
      softDelete( 'isRemoved' ),
      snakeCaseQuery()
    ],
    create: [
      validate( creationSchema ),
      generateUid(),
      checkUnicity( 'email' ),
      formatStore(),
      softDelete( 'isRemoved' ),
      snakeCase(),
      snakeCaseQuery()
    ],
    update: disallow(),
    patch: [
      stashBefore(),
      iff(
        some( isAction( 'setImageProfile' ), isAction( 'clearImageProfile' ) ),
        keep( 'image' )
      ),
      iff(
        isAction( 'requestChangeEmail' ),
        [
          validate( {
            newEmail: {
              optional: false,
              type: 'email'
            }
          } ),
          checkUnicity( 'email', 'data.newEmail' ),
          generateToken( 'newEmailToken' ),
          setInStore( 'newEmailToken', 'newEmailToken' ),
          setInStore( 'newEmail', 'data.newEmail' ),
          keep( 'store' )
        ]
      ),
      iff(
        isAction( 'confirmChangeEmail' ),
        [
          isValidToken( 'params.before.store.newEmailToken', 'params.query.token' ),
          checkUnicity( 'email', 'params.before.store.newEmail' ),
          changeEmailFromStore(),
          discardQuery( 'token' ),
          keep( 'email', 'store' )
        ]
      ),
      iff(
        isAction( 'changePassword' ),
        [
          validate( {
            password: {
              optional: false,
              type: 'text',
              min: 4
            }
          } ),
          hashPassword( 'data.password', 'params.before.salt' ),
          keep( 'password' )
        ]
      ),
      iff(
        isAction( 'generateApiKey' ),
        [
          paramsFromClient( 'publicKey', 'secretKey' ),
          generateApiKey(),
          keep()
        ]
      ),
      iff(
        isAction( 'setNewFlag' ),
        [
          validate( {
            isNew: {
              optional: false,
              type: 'boolean'
            }
          } ),
          keep( 'isNew' )
        ]
      ),
      // If there are not action you can modify your profile
      iff(
        isAction( undefined ),
        [
          validate( {
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
          } ),
          keep( 'fullName', 'culture', 'isRemoved' )
        ]
      ),
      iff(
        isAction( 'refresh' ),
        [
          iff( dataExists( 'lastSignin' ), setNow( 'lastSignin' ) ),
          iff( dataExists( 'lastInboxCheck' ), setNow( 'lastInboxCheck' ) ),
          iff( dataExists( 'lastNotified' ), setNow( 'lastNotified' ) ),
          keep( 'lastSignin', 'lastInboxCheck', 'lastNotified' )
        ]
      ),
      formatStore(),
      softDelete( 'isRemoved' ),
      snakeCase(),
      snakeCaseQuery()
    ],
    remove: [
      softDelete( 'isRemoved' ),
      snakeCase(),
      snakeCaseQuery()
    ]
  },

  after: {
    all: [
      camelCase(),
      camelCaseQuery(),
      parseStore(),
      fastJoin( userResolvers ),
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
        }
      } )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error( context ) {
    // Avoid soft delete error
    if ( context.error instanceof errors.NotFound && context.error.message.includes( 'Item not found' ) ) {
      context.result = null;
      return context;
    }

    log.error(
      `Error in '${context.path}' service method '${context.method}'\n${context.error.stack}\n`,
      inspect( _.omit( context.error, [ 'hook.app', 'hook.service' ] ), { colors: true } )
    );
  }
}
