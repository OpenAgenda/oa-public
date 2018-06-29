const path = require( 'path' );
const _ = require( 'lodash' );
const express = require( 'express' );
const morgan = require( 'morgan' );
const reload = require( 'reload' );
const walk = require( 'walk' );
const VError = require( 'verror' );
const config = require( './config' );
const { render } = require( './' );

config.init( require( './config/development' ) ).catch( error => console.log( 'Initializing error:', error ) );

function recursiveListPaths( base, regex, cb ) {
  const walker = walk.walk( base, {
    followLinks: false,
    filters: [ 'node_modules', 'scripts', '.git' ]
  } );

  const paths = [];

  walker.on( 'directory', ( root, stat, next ) => {
    if ( !regex || regex.test( stat.name ) ) {
      paths.push( `${root.replace( base, '/' )}${stat.name}.mjml` );
    }

    next();
  } );

  walker.on( 'end', () => cb( null, paths ) );
}

function getTemplatesLangs( templateName ) {
  const labels = ( config.translations.labels || {} )[ templateName ] || {};

  return _.uniq( _.flatten( _.map( labels, _.keys ) ) );
}

const app = express();

app.use(
  morgan( 'dev', {
    skip: req => [ '/reload/reload.js', '/robots.txt' ].includes( req.path )
  } )
);

app.get( '/', ( req, res, next ) => {
  recursiveListPaths( config.templatesDir, false, ( err, paths ) => {
    if ( err ) return next( err );

    res.send(
      [
        '<html>',
        '<body>',
        '<h1>Templates list</h1>',
        '<ul>',
        paths.map( p => `<li><a href="${p}">${p}</a></li>` ).join( '' ),
        '</ul>',
        '</body>',
        '</html>'
      ].join( '' )
    );
  } );
} );

app.get( /.mjml$/, ( req, res, next ) => {
  if ( req.path.includes( 'reload/reload.js' ) ) {
    return next();
  }

  const templateName = req.path.slice( 1, -5 );
  const templateDir = path.join( config.templatesDir, templateName );
  const fixturesPath = path.join( templateDir, 'fixtures.js' );
  let data;
  let html;

  try {
    data = require(fixturesPath); // eslint-disable-line
  } catch ( e ) {
    console.log( `No fixtures for the template ${templateName}` );
    data = {};
  }

  Object.assign( data, config.defaults.data );

  const langs = getTemplatesLangs( templateName );

  html = render( templateName, data, { lang: req.query.lang || config.defaults.lang } );
  if ( langs.length ) {
    html = html.replace(
      '<body>',
      [
        '<body>',
        '<ul style="text-align: center; padding-left: 0">',
        langs.map( l => `<li style="display: inline; margin-right: 10px"><a href="?lang=${l}">${l}</a></li>` ).join( '' ),
        '</ul>',
        '<hr />'
      ].join( '' )
    );
  }
  html = html.replace( '</body>', '<script src="/reload/reload.js"></script></body>' );

  res.send( html );
} );

app.use( ( err, req, res, next ) => {
  console.error( err.stack );

  if ( res.headersSent ) {
    return next( err );
  }

  const content = err instanceof VError ? JSON.stringify( err, null, 2 ) : err.toString();
  const html = `<html><body>${_.escape( content )}</body></html>`;

  res.status( 500 ).send( html.replace( '</body>', '<script src="/reload/reload.js"></script></body>' ) );
} );

app.listen( 3000 );

reload( app );
