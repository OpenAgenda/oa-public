const logs = require( '@openagenda/logs' );
const mwUploadImage = require( '@openagenda/image-upload/lib/middleware' );

let service, config;
let agendasSvc;

module.exports = {
  init,
  create,
  get,
  set,
  setImage,
  clearImage,
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

  agendasSvc.set(
    { slug: req.params.slug },
    req.body,
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

function setImage( req, res, next ) {

  agendasSvc.get( { slug: req.params.slug }, { instanciate: true, private: null }, ( err, result ) => {

    if ( err ) return next( err );

    mwUploadImage( {
      dest: '/var/tmp',
      handler: ( tmpPath, info, cb ) => {

        result.setImage( { path: tmpPath }, ( err, paths ) => {

          if ( err ) return cb( err );

          cb( null, paths[ 0 ] );

        } );

      }
    } )( req, res, next );

  } );

}

function clearImage( req, res, next ) {

  agendasSvc.get( { slug: req.params.slug }, { instanciate: true, private: null }, ( err, result ) => {

    if ( err ) return next( err );

    result.clearImage( err => {

      if ( err ) next( err );

      res.json();

    } );

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
