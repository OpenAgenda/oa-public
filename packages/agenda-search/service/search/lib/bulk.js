"use strict";

const _ = require( 'lodash' );

const filter = require( './filter' );

module.exports = async ( { client, obj, index, image, operation }, agendas ) => {

  const body = _.flatten( agendas.filter( filter ).map( a => [{
    [operation]: {
      _id: a.uid
    }
  }, operation === 'index' ? obj.clean( a, { image } ) : { doc: obj.clean( a, { image } ) }
  ] ) );

  if ( !body.length ) return 0;

  const result = await client.bulk({
    index,
    body
  });

  return _.get( result, 'body.items', [] ).length;

}
