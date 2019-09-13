"use strict";

const _ = require( 'lodash' );
const abilitiesSvc = require( '@openagenda/abilities' );

const getUnsubscriptionTarget = require( './getUnsubscriptionTarget' );

const { TOKEN_REGEX } = require( './tokenRegex' );

module.exports = async ( { knex, schemas }, token ) => {
  if ( !token.match( TOKEN_REGEX ) ) {
    throw new Error( 'Unsubscription token is malformed' );
  }

  const row = await knex( schemas.unsubscriptionLink )
    .first().where( { token } );

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

  const target = getUnsubscriptionTarget( unsubscription.target );

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
