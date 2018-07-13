"use strict";

import utils from '@openagenda/utils';

module.exports = clean;

function clean( schema ) {
  
  if ( _isLeaf( schema ) ) {

    return utils.extend( {}, schema );

  }

  let cleanSchema = { 
    fields: {}, 
    list: false,
    type: 'schema'
  },

  schemaFields;

  if ( _isNormalized( schema ) ) {

    utils.extend( cleanSchema, schema );

    schemaFields = schema.fields;

  } else {

    schemaFields = schema;

  }

  Object.keys( schemaFields ).forEach( branchKey => {

    cleanSchema.fields[ branchKey ] = clean( schemaFields[ branchKey ] );

  } );

  return cleanSchema;

}


function _isNormalized( schema ) {

  if ( schema.fields ) return true;

  return false;

}


function _isLeaf( node ) {

  let is = false;

  if ( node && node.type && typeof node.type !== 'object' && node.type !== 'schema' ) {

    is = true;

  } else {

    is = !Object.keys( node || {} ).filter( k => {

      return ( typeof node[ k ] === 'object' && node[ k ] !== null );

    } ).length;

  }

  return is;

}