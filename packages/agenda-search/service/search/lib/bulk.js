"use strict";

const _ = require( 'lodash' );

const filter = require( './filter' );

module.exports = async ( { client, obj, index, image, operation }, agendas ) => {

  const body = _.flatten( agendas.filter( filter ).map( a => [
    _.set( {}, operation, {
      _index: index,
      _type: obj.type,
      _id: a.uid
    } ),
    operation === 'index' ? obj.clean( a, { image } ) : { doc: obj.clean( a, { image } ) }
  ] ) );

  if ( !body.length ) return 0;

  const result = await client.bulk( { body } );

  return _.get( result, 'items', [] ).length;

}
