const logger = require( 'basic-logger' );
const agendas = require( 'agendas' );

let service, config, log;

module.exports = {
  init,
  create,
  slugs: {
    available: slugAvailable
  }
};

function init( s, c ) {

  service = s;
  config = c;

  if ( c.logger ) {

    logger.setLogger( c.logger );

  }

  log = logger( 'agenda-settings' );

  agendas.init( c );

}

function create( req, res, next ) {

  agendas.set( Object.assign( req.body, { ownerId: req.user.id } ), ( err, result ) => {

    if ( err ) return next( err );

    if ( result.errors.length ) res.status( 400 );

    return res.json( result );

  } );

}

function slugAvailable( req, res, next ) {

  agendas.slugs.isTaken( req.body.slug, ( err, result ) => {

    if ( err ) return next( err );

    if ( result.taken ) {

      result.errors.push( {
        field: 'slug',
        code: 'duplicate',
        message: 'duplicate value found',
        origin: req.body.slug
      } );

    }

    if ( result.errors.length ) res.status( 400 );

    return res.json( result );

  } );

}
