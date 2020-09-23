const logs = require( '@openagenda/logs' );

let service, config;
let agendasSvc;

module.exports = {
  init,
  create,
  get,
  set,
  slugs: {
    available: slugAvailable
  }
};

function init( s, c ) {

  service = s;
  config = c;

  if ( c.logger ) {

    logs.setModuleConfig( c.logger );

  }

  agendasSvc = config.services.agendas;

}

function create( req, res, next ) {

  agendasSvc.set( Object.assign( req.body, { ownerId: req.user.id } ), { private: null }, ( err, result ) => {

    if ( err ) return next( err );

    if ( result.errors.length ) res.status( 400 );

    return res.json( result );

  } );

}

function get( req, res, next ) {

  agendasSvc.get( { uid: req.params.uid }, { includeImagePath: true, private: null, internal: true }, ( err, result ) => {

    if ( err ) return next( err );

    return res.json( result );

  } );

}

function set( req, res, next ) {
  const image = req.files && req.files.image && req.files.image[0];
  const body = Object.assign({ image }, JSON.parse(req.body.data));

  agendasSvc.set(
    { slug: req.params.slug },
    body,
    {
      includeImagePath: true,
      private: null,
      context: req.context || null,
      internal: true
    }, ( err, result ) => {

      if ( err ) return next( err );

      if ( result.errors.length ) res.status( 400 );

      return res.json( result );

    } );

}

function slugAvailable( req, res, next ) {

  agendasSvc.slugs.isTaken( req.body.slug, { excludeUid: req.body.excludeUid || false }, ( err, result ) => {

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
