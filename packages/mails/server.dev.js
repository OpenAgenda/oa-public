const path = require( 'path' );
const _ = require( 'lodash' );
const express = require( 'express' );
const morgan = require( 'morgan' );
const reload = require( 'reload' );
const walk = require( 'walk' );
const VError = require( 'verror' );
const config = require( './config' );
const { render } = require( './' );

config.init().catch( error => console.log( 'Initializing error:', error ) );

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

function getTemplatesLangs( labels ) {
  return _.uniq( _.flatten( _.map( labels, _.keys ) ) );
}

function renderLangsList( langs ) {
  return [
    '<ul style="text-align: center; padding-left: 0">',
    '<b>Language</b><br />',
    langs.map( l => `<li style="display: inline"><a href="?lang=${l}">${l}</a></li>` ).join( '&nbsp;&nbsp;' ),
    '</ul>'
  ].join( '' );
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

  try {
    data = require(fixturesPath); // eslint-disable-line
  } catch ( e ) {
    console.log( `No fixtures for the template ${templateName}` );
    data = {};
  }

  Object.assign( data, config.defaults.data );

  const labels = data.$labels || {};
  const langs = getTemplatesLangs( labels );
  const lang = req.query.lang || config.defaults.lang || langs[ 0 ];
  const __ = config.translations.makeLabelGetter( labels, lang );

  const { html: initialHtml, text, subject } = render( templateName, data, { lang, __ } );
  let html = initialHtml;

  if ( subject ) {
    html = html.replace(
      '<body>',
      [
        '<body>',
        `<div style="text-align: center"><b>Subject:</b> ${subject}</div>`,
        '<hr style="max-width: 600px" />'
      ].join( '' )
    );
  }

  if ( langs.length ) {
    html = html.replace( '<body>', [ '<body>', renderLangsList( langs ), '<hr style="max-width: 600px" />' ].join( '' ) );
  }

  if ( text ) {
    html = html.replace(
      '</body>',
      [
        '<hr style="max-width: 600px" />',
        '<h2 style="text-align: center">Text version</h2>',
        `<div style="max-width: 600px; margin: 0 auto;">${text.replace( /(?:\r\n|\r|\n)/g, '<br>' )}</div>`,
        '</body>'
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
