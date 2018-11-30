"use strict";

const app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  webpack: true,
  babelServer: true
} );

const fixtures = require( '../fixtures' );

const config = require( '../../testconfig.js' );

const locationsEditor = require( '../../' );

const agendaId = 123;
const userUid = 456;

const mw = locationsEditor.mw( 'agendaId' );

app.use( require( 'body-parser' ).json() );


/**
 * agenda id is expected to be loaded for all
 * operations
 */
app.all( '*' , ( req, res, next ) => {

  req.agendaId = agendaId;

  req.userUid = 456;

  next();

} );

// does nothing if not xhr
app.get( '/', mw.list );


app.get( '/resync', mw.resync );


app.get( '/', ( req, res, next ) => {

  if ( req.xhr ) {

    setTimeout( () => {

      res.json( {
        items: req.locations.items,
        total: req.locations.total
      } );

    }, 2000 );

    return;

  } else {

    req.content = [
      '<div class="js_locations_counter" data-options="',
      JSON.stringify( { res: '/toverify' } ).replace( /"/g, '&quot;' ),
      '"></div>',
      '<div class="js_locations_canvas"></div>'
    ].join( '' );

  }

  next();

} );

app.get( '/favicon.ico', ( req, res ) => { res.send( 'bite me.' ) } );

app.get( '/toverify', mw.getUnverifiedCount );

app.get( '/geocode', mw.geocode );

app.get( '/insee', mw.insee );

app.get( '/geocode/reverse', mw.reverseGeocode );

app.get( '/terms', mw.list.terms );

app.get( '/:locationUid', mw.load, ( req, res ) => res.json( req.location ) );

app.post( '/', mw.set );

app.post( '/remove', mw.remove );

app.post( '/image', mw.newImageUpload );

app.post( '/image/remove', mw.newImageRemove );

app.get( '/:locationUid/suggestion*', ( req, res, next ) => {

  // preload stakeholderId

  req.stakeholderId = 456;

  next();

} );

app.get( '/stakeholders/:stakeholderId', ( req, res, next ) => {

  req.stakeholderId = req.params.stakeholderId;
  req.agendaId = 123;

  next();

} );

app.get( '/stakeholders/:stakeholderId', mw.getStakeholder );

app.post( '/:locationUid/suggestion*', ( req, res, next ) => {

  req.stakeholderId = 456;

  next();

} );

app.post( '/:locationUid/image', mw.imageUpload );

app.post( '/:locationUid/image/remove', mw.imageRemove );


app.post( '/merge', mw.merge );

if ( ( process.argv || [] ).indexOf( 'fixtures' ) !== -1 ) {

  // put the locations fixtures in their place
  fixtures( agendaId, ( err, result  ) => {

    locationsEditor.init( config, () => {

      // rebuild index and listen on port
      locationsEditor.rebuild( () => app.getAndListen() );

    } );

  } );

} else {

  locationsEditor.init( config, () => {

    app.getAndListen();

  } );

}
