export function createLink( entity, rules ) {
  const subject = getSubject( entity );

  if ( !subject ) {
    throw new Error( '`email` or `entityName` plus `identifier` are required for create an unsubscription link' );
  }

  // TODO create { token, subject, rule }
  // const id = knex( config.schemas.unsubscribed ).insert( { token, subject, rule } );
  // const unsubscription = knex( config.schemas.unsubscribed ).select().first().where( { id } );
  // return link
}

function getSubject( entity ) {
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

export function processLink( token ) {

}
