"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );

const router = express.Router( { mergeParams: true } );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/dist/manifest.json', 'utf-8' ) );

module.exports = _.assign( router, {
  dist: express.static( __dirname + '/../client/dist' ),
  setService: service => router.service = service,
  setLayout: layout => router.layout = layout
} );

router.use( async ( req, res, next ) => {

  const agenda = await router.service.config.interfaces.getAgenda( {
    slug: req.params.agendaSlug
  } );

  if ( !agenda ) return next( 404 );

  const {
    schema,
    extensions
  } = await router.service.config.interfaces.getSchemas( agenda );

  _.assign( req, { agenda, schema, extensions } );

  next();

} );

router.get( '/', ( req, res ) => {

  const props = _.pick( req, [ 'schema', 'extensions', 'lang' ] );

  const stringifiedProps = JSON.stringify(
    props,
    ( k, v ) => _.isString( v ) ? v.replace( '</script>', '<CLOSINGSCRIPTTAG>' ) : v,
    2
  );

  res.end( router.layout(
    `<div>
      <div class="js_preload_spin" id="app"></div>
      <script type="application/json" id="props">${stringifiedProps}</script>
      <script defer type="text/javascript" src="${_getClientAppPath( router.service.name, router.service.config )}"></script>
    </div>`, req ) );

} );

function _getClientAppPath( serviceName, config ) {

  const distFileName = manifest[ 'main.js' ];

  if ( config.frontAppPath ) {

    return config.frontAppPath + '/' + distFileName;

  }

  if ( process.env.NODE_ENV === 'development' ) return '/js/app.js';

  return [
    config.CDNPath + serviceName,
    distFileName
  ].join( '/' );

}
