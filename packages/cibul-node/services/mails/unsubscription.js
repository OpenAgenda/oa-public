const _ = require( 'lodash' );
const express = require( 'express' );
const uuid = require( 'uuid/v4' );
const abilitiesSvc = require( '@openagenda/abilities' );
const usersSvc = require( '@openagenda/users' );
const sessions = require( '@openagenda/sessions' );
const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
const labels = require( '@openagenda/labels/unsubscription' );
const log = require( '@openagenda/logs' )( 'services/mails/unsubscription' );
const { knex, schemas } = require( '../../config' );

const TOKEN_REGEX_STRING = '\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}';
const TOKEN_REGEX = new RegExp(`^${TOKEN_REGEX_STRING}$`);

const getLabel = makeLabelGetter( labels );
const app = express();


function getTarget( entity ) {
  if ( typeof entity === 'string' ) {
    return { email: entity };
  }

  if ( [ 'entityName', 'identifier' ].every( key => key in entity ) ) {
    return {
      entityName: entity.entityName,
      identifier: entity.identifier
    };
  }

  if ( 'email' in entity ) {
    return { email: entity.email };
  }

  return null;
}

async function createToken( entity, action, subject, conditions, fields ) {
  const target = getTarget( entity );
  const rule = {
    action,
    subject,
    conditions,
    fields
  };

  if ( !target ) {
    throw new Error( '`email` or `entityName` plus `identifier` are required for create an unsubscription link' );
  }

  const token = uuid();

  await knex( schemas.unsubscriptionLink )
    .insert( {
      token,
      target: JSON.stringify( target ),
      rule: JSON.stringify( abilitiesSvc.rules.format( rule ) )
    } );

  return token;
}

async function processToken( token ) {
  if ( !token.match( TOKEN_REGEX ) ) {
    throw new Error( 'Unsubscription token is malformed' );
  }

  const row = await knex( schemas.unsubscriptionLink )
    .select()
    .first()
    .where( { token } );

  if ( !row ) {
    throw new Error( 'Unsubscription token is not found' );
  }

  if ( row.processed_at !== null ) {
    throw new Error( 'Unsubscription token already used' );
  }

  const unsubscription = {
    id: row.id,
    token,
    target: JSON.parse( row.target ),
    rule: abilitiesSvc.rules.parse( JSON.parse( row.rule ) )
  };

  const target = getTarget( unsubscription.target );

  if ( target.email ) {
    await knex( 'unsubscribed' )
      .insert( {
        email: target.email,
        created_at: new Date(),
        updated_at: new Date()
      } );
  } else {
    const ability = await abilitiesSvc.get( target.entityName, target.identifier );
    const formIndex = await ability.getFormIndex();
    const matchesRule = test => _.matches(
      _.pick(
        test,
        // 'entityName',
        // 'identifier',
        'actions',
        'subject',
        'conditions'
      )
    );
    const rulesToChange = formIndex.filter( matchesRule( unsubscription.rule ) );
    const ruleToUpdate = rulesToChange.map( rule => ( {
      ..._.omit( rule, 'entity', 'relevantRule' ),
      inverted: true
    } ) );

    await ability.updateFormIndex( ruleToUpdate );
  }

  await knex( schemas.unsubscriptionLink )
    .update( {
      processed_at: new Date()
    } )
    .where( { token } );

  return unsubscription;
}

async function isUnsubscribed( entity, action, subject, conditions, fields ) {
  const target = getTarget( entity );

  if ( !target ) {
    throw new Error( '`email` or `entityName` plus `identifier` are required for check an unsubscription' );
  }

  // Defined target
  if ( target.identifier ) {
    const ability = await abilitiesSvc.get( target.entityName, target.identifier );

    return !ability.can( action, subject, conditions, fields );
  }

  // User found target
  const user = await usersSvc.findOne( {
    query: {
      email: target.email
    }
  } );

  if ( user ) {
    const ability = await abilitiesSvc.get( 'user', user.uid );

    return !ability.can( action, subject, conditions, fields );
  }

  // Email target
  if ( target.email ) {
    return !!( await knex( 'unsubscribed' )
      .select()
      .first()
      .where( { email: target.email } ) );
  }
}

function task() {
  knex( schemas.unsubscriptionLink )
    .delete()
    .where( 'created_at', '<', new Date( new Date().getTime() - (1000 * 60 * 60 * 24 * 90) ) )
    .then(
      () => log.info( 'Old unsubscription links removed successfully' ),
      err => log.error( 'Unable to remove old unsubscription links', err )
    );
}


module.exports = ( parentApp, path = '' ) => {
  app.use( `/unsubscribe/:token(${TOKEN_REGEX_STRING})`, ( req, res, next ) => {
    const { token } = req.params;

    if ( !token.match( TOKEN_REGEX ) ) {
      res.status( 400 );
      return next( new Error( getLabel( 'tokenMalformed', req.lang ) ) );
    }

    processToken( token )
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

module.exports.createToken = createToken;
module.exports.processToken = processToken;
module.exports.isUnsubscribed = isUnsubscribed;
module.exports.task = task;
