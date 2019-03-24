"use strict";

const _ = require( 'lodash' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );

const log = require( '@openagenda/logs' )( 'router' );

const router = express.Router( { mergeParams: true } );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/dist/manifest.json', 'utf-8' ) );

module.exports = _.assign( router, {
  dist: express.static( __dirname + '/../client/dist' ),
  setService: service => router.service = service,
  setLayout: layout => router.layout = layout
} );

router.post( '/',
  bodyParser.json(),
  async ( req, res ) => {

    try {

      await router.service.setSchemaFields( { slug: req.params.agendaSlug }, JSON.parse( req.body.data ).fields );

      res.send( 'ok' );

    } catch ( e ) {

      log( 'error', e );

      res.status( 400 ).send( 'nok' )

    }

  }
);

router.get( '/', async ( req, res, next ) => {

  const props = { lang: req.lang };
  const layoutData = { lang: req.lang };

  try {

    const resources = await router.service.loadAppResources( { slug: req.params.agendaSlug } );

    _.assign( props, resources );

    props.agenda = _.pick( props.agenda, [ 'slug', 'uid' ] );

    _.assign( layoutData, _.pick( resources, [ 'agenda' ] ) );

  } catch ( e ) {

    console.log(e);

    log( 'error', e );

    return next( 500 );

  }

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
    </div>`, layoutData ) );

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
