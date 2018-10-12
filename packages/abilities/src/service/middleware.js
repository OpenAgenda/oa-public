import _ from 'lodash';
import service from './index';

function wrap( fn ) {
  return ( req, res, next ) => Promise.resolve( fn( req, res, next ) ).catch( next );
}

export function getFormIndex( options ) {
  const { namespaces } = _.merge( {
    namespaces: {
      entityName: 'query.entityName',
      identifier: 'query.identifier'
    }
  }, options );

  return wrap( async ( req, res, next ) => {
    const entityName = _.get( req, namespaces.entityName, null );
    const identifier = _.toNumber( _.get( req, namespaces.identifier, null ) );

    if ( !_.isString( entityName ) ) {
      res.status( 400 );
      throw new Error( 'entityName should be a string' );
    }

    if ( !identifier ) {
      res.status( 400 );
      throw new Error( 'identifier should be a number' );
    }

    const ability = await service.get( entityName, identifier );
    const formIndex = await ability.getFormIndex();

    res.send( formIndex );

    next();
  } );
}
