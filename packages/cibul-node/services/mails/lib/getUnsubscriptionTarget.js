"use strict";

module.exports = entity => {
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
