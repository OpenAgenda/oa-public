"use strict";

module.exports.parseBase = ( field, minMaxed = false ) => {

  let base = {
    field: field.name,
    optional: field.optional !== undefined ? !!field.optional : true,
    label: field.label,
    fieldType: field.fieldType,
    read: field.type === 'private' ? 'moderator' : null,
    write: 'contributor'
  }

  if ( minMaxed && field.min ) {

    base.min = field.min;

  }

  if ( minMaxed && field.max ) {

    base.max = field.max;

  }

  if ( field.info ) {

    base.info = field.info;

  }

  return base;

}