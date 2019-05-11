"use strict";

const _ = require( 'lodash' );
const https = require( 'https' );

const app = require( 'express' )();

const config = require( '../config' );
const legacyEventSvc = require( '../services/event' );
const legacyAgendaSvc = require( '../services/agenda' );

const { cleanString } = require( '@openagenda/utils' );

module.exports = ( parentApp, path = '' ) => {

  parentApp.use( path, app );

}

app.param( 'slug', legacyAgendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ) );

app.param( 'eventSlug', legacyEventSvc.mw.load( 'eventSlug', 'slug' ) );

app.param( 'eventSlug', legacyEventSvc.mw.format );

app.param( 'eventSlug', legacyAgendaSvc.mw.decorateEvent( true ) );

app.get( '/:slug/events/:eventSlug/files/:file', ( req, res, next ) => {

  const file = _.head( req.formatted.custom.filter( c => c.fieldType === 'file' && c.name === req.params.file ) )

  if ( !file ) return res.sendStatus( 404 );

  const s3FilePath = config.aws.imageBucketPath + file.value.uploaded;

  https.get( encodeURI( s3FilePath ), s3Res => {

    const filename = cleanString( file.value.name );

    res.writeHead( 200, {
      'Content-Type' : config.authorizedMimeTypes[ filename.split( '.' ).pop() ],
      'content-disposition' : `attachment; filename="${filename}"`
    } );

    s3Res.pipe( res );

  } );

} );
