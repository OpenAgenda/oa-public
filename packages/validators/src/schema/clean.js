"use strict";

import utils from 'utils';

module.exports = clean;

function clean( schema ) {
  
  if ( _isLeaf( schema ) ) {

    return utils.extend( {}, schema );

  }

  let cleanSchema = { fields: {}, list: false, type: 'schema' },

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

  return !Object.keys( node ).filter( k => {

    return typeof node[ k ] === 'object'

  } ).length;

}