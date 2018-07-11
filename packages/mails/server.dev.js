const path = require( 'path' );
const { URL } = require( 'url' );
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
    filters: [ 'node_modules', '.git' ]
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

function withReload( html ) {
  return html.replace( '</body>', '<script src="/reload/reload.js"></script></body>' );
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

app.get( /.mjml$/, async ( req, res, next ) => {
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

  let html;
  let text;
  let subject;
  try {
    ( { html, text, subject } = await render( templateName, data, {
      lang,
      __
    } ) );
  } catch ( error ) {
    return next( error );
  }

  switch ( req.query.raw ) {
    case 'html': {
      return res.send( req.query.ignoreReload ? html : withReload( html ) );
    }
    case 'text': {
      const textPage = `<html><body>${text}</body></html>`;
      return res.send( req.query.ignoreReload ? textPage : withReload( textPage ) );
    }
    case 'subject': {
      const subjectPage = `<html><body>${subject}</body></html>`;
      return res.send( req.query.ignoreReload ? subjectPage : withReload( subjectPage ) );
    }
    default:
  }

  const baseUrl = `${req.protocol}://${req.get( 'host' )}${req.originalUrl}`;
  const getRawUrl = type => {
    const url = new URL( baseUrl );
    url.searchParams.delete( 'raw' );
    url.searchParams.set( 'raw', type );
    return url;
  };

  const iframeSrc = getRawUrl( 'html' );
  iframeSrc.searchParams.set( 'ignoreReload', '1' );

  const initialHtml = [
    '<html><body style="margin: 0">',
    '<script>',
    '  function resizeIframe( obj ) {',
    "    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';",
    '  }',
    '</script>',
    ...( langs.length ? [ renderLangsList( langs ), '<hr style="max-width: 600px" />' ] : [] ),
    ...( subject !== null
      ? [
        `<div style="text-align: center"><b>Subject <small>(<a href="${getRawUrl( 'subject' )}">raw</a>)</small>:</b> `,
        subject,
        '</div>',
        '<hr style="max-width: 600px" />'
      ]
      : [] ),
    '<div style="display: flex">',
    '<div style="margin: 0 auto">',
    `<h2 style="text-align: center">Html version <small>(<a href="${getRawUrl( 'html' )}">raw</a>)</small></h2>`,
    `<iframe src="${iframeSrc}" frameborder="0" scrolling="no" width="600px" onload="resizeIframe(this)">`,
    '</iframe>',
    '</div>',
    ...( text !== null
      ? [
        '<div style="margin: 0 auto">',
        `<h2 style="text-align: center">Text version <small>(<a href="${getRawUrl( 'text' )}">raw</a>)</small></h2>`,
        `<div style="max-width: 600px; margin: 0 auto;">${text.replace( /(?:\r\n|\r|\n)/g, '<br>' )}</div>`,
        '</div>'
      ]
      : [] ),
    '</div></body></html>'
  ].join( '' );

  res.send( withReload( initialHtml ) );
} );

app.use( ( err, req, res, next ) => {
  console.error( err.stack );

  if ( res.headersSent ) {
    return next( err );
  }

  const content = err instanceof VError ? JSON.stringify( err, null, 2 ) : err.toString();
  const html = `<html><body>${_.escape( content )}</body></html>`;

  res.status( 500 ).send( withReload( html ) );
} );

app.listen( 3000 );

reload( app );
