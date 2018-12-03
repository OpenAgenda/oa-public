import _ from 'lodash';
import sa from 'superagent';

export default ( { res, values, files, query } ) => {

  const hasFiles = _.keys( files ).length;

  // IE11 does not like empty strings;
  const req = sa.post( res || _.get( window, 'location.href' ) );

  req.ok( res => res.status < 500 );

  if ( _.isObject( query ) ) {

    req.query( query );

  }

  if ( !hasFiles ) {

    return req.send( {
      data: JSON.stringify( values )
    } );

  }

  _.keys( files ).forEach( fieldName => {

    // handle multiple files if need be
    [].concat( files[ fieldName ] ).forEach( ( file, index ) => {

      if ( !files[ fieldName ] ) throw new Error( 'file field is not defined: ' + fieldName );

      req.attach( fieldName, files[ fieldName ][ index ] );

    } );

  } );

  req.field( 'data', JSON.stringify( values ) );

  return new Promise( ( rs, rj ) => {

    req.end( ( err, res ) => err ? rj( err ) : rs( res ) );

  } );

}
