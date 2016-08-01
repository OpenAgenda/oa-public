"use strict";

const utils = require( 'utils' );

module.exports = map => {

  return {
    toObj,
    toDb,
    fields,
    isInternal,
    isProtected
  }

  function isInternal( type = 'db', field ) {

    let internals = map.filter( rule => typeof rule === 'object' && rule[ type ] === field && rule.internal );

    return !!internals.length;

  }

  function isProtected( type = 'db', field ) {

    let prot = map.filter( rule => typeof rule === 'object' && rule[ type ] === field && rule.protected );

    return !!prot.length;

  }

  function fields( type = 'db', includeInternal = false, forceInclude = [] ) {

    return map.map( rule => {

      if ( typeof rule === 'string' ) return rule;

      if ( typeof rule.internal === 'undefined' ) return rule[ type ];

      if ( rule.internal && !includeInternal && forceInclude.indexOf( rule[ type ] ) === -1 ) return false;

      return rule[ type ];

    } ).filter( f => !!f );

  }

  function toObj( entry ) {

    let obj = {};

    map.forEach( rule => {

      rule = typeof rule === 'string' ? {
        db: rule,
        obj: rule
      } : rule;

      if ( entry[ rule.db ] === undefined ) return;

      try {

        obj[ rule.obj ] = rule.type === 'json' ? JSON.parse( entry[ rule.db ] ) : entry[ rule.db ];

      } catch( e ) {

        return console.error( e );

      }

    } );

    return obj;

  }

  function toDb( obj ) {

    let entry = {};

    map.forEach( rule => {

      rule = typeof rule === 'string' ? {
        db: rule,
        obj: rule
      } : rule;

      if ( obj[ rule.obj ] === undefined ) return;

      entry[ rule.db ] = rule.type === 'json' ? JSON.stringify( obj[ rule.obj ] ) : obj[ rule.obj ];

    } );

    return entry;
    
  }

}