"use strict";

const { inspect } = require( 'util' );
const _ = require( 'lodash' );
const uuid = require( 'uuid/v4' );
const errors = require( '@feathersjs/errors' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const { alterItems, iff, isProvider, keep, validate: validateHook } = require( 'feathers-hooks-common' );

schema.register( {
  text: validators.text,
  email: validators.email
} );


const isAction = action => context => (context.params || {}).action === action;

const camelCase = () => alterItems( record => _.mapKeys( record, ( value, key ) => _.camelCase( key ) ) );
const snakeCase = () => alterItems( record => _.mapKeys( record, ( value, key ) => _.snakeCase( key ) ) );
const parseStore = () => alterItems( record => ({ ...record, store: JSON.parse( record.store || '{}' ) }) );
const formatStore = () => alterItems( record => ({ ...record, store: JSON.stringify( record.store || {} ) }) );

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

  return validateHook( values => {
    try {
      _validate( values );
    } catch ( e ) {
      return e;
    }
  } );
}

const setInStore = ( key, getter = key ) => async context => {
  const user = await context.service.get( context.id );

  const value = typeof getter === 'function' ? await getter( context ) : _.get( context, getter );

  context.data.store = _.merge( {}, user.store, context.data.store, _.set( {}, key, value ) );
};

const load = () => async context => {
  context.entity
};

const isValidToken = () => context => {

};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      /* TODO validation */
      generateUid(),
      checkUnicity( 'email' ),
      formatStore(),
      snakeCase()
    ],
    update: [
      formatStore(),
      snakeCase()
    ],
    patch: [
      iff(
        isAction( 'requestChangeEmail' ),
        [
          checkUnicity( 'email', 'data.newEmail' ),
          validate( {
            newEmail: {
              type: 'email'
            }
          } ),
          generateToken( 'newEmailToken' ),
          setInStore( 'newEmailToken', 'newEmailToken' ),
          setInStore( 'newEmail', 'data.newEmail' ),
          keep( 'store' )
        ]
      ),
      iff(
        isAction( 'confirmChangeEmail' ),
        [
          load(),
          isValidToken( 'query.token', 'entity.store.newEmailToken' ),
          // checkUnicity( 'email', 'data.newEmail' )
          // check saved token (compare with token in query)
          // delete newEmail & newEmailToken
          // save newEmail
        ]
      ),
      iff(
        isProvider( 'external' ),
        [
          keep( 'fullName', 'culture' ),
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
            }
          } )
        ]
      ),
      formatStore(),
      snakeCase()
    ],
    remove: []
  },

  after: {
    all: [
      camelCase(),
      parseStore()
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error( context ) {
    console.error( `Error in '${context.path}' service method '${context.method}'\n${context.error.stack}` );

    console.log( inspect( _.omit( context.error, [ 'hook.app', 'hook.service' ] ), { colors: true } ) );
  }
}
