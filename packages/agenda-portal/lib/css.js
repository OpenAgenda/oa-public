"use strict";

const sass = require( 'node-sass' );
const { promisify } = require( 'util' );

const log = require( './Log' )( 'lib/css' );

const writeFile = promisify( require( 'fs' ).writeFile );
const render = promisify( sass.render );

module.exports = {
  appendCssBuildMiddleware,
  buildCss
}

function buildCss( sassFile, cssDestinationFolder ) {

  return _cssify( sassFile, cssDestinationFolder + '/' + _cssName( sassFile ) );

}

function appendCssBuildMiddleware( app, sassFile, cssDestinationFolder ) {

  app.use( '/' + _cssName( sassFile ), _middleware.bind( null, {
    from: sassFile,
    to: cssDestinationFolder + '/' + _cssName( sassFile )
  } ) );

}

async function _cssify( src, dst ) {

  log( 'creating css %s from %s', dst, src );

  const { css } = await render( { file: src } );

  await writeFile( dst, css );

}

function _middleware( { from, to }, req, res, next ) {

  _cssify( from, to ).then( next );

}

function _cssName( sassFile ) {

  const parts = sassFile.split( '.' );

  parts.pop();

  return parts.join( '.' ).split( '/' ).pop() + '.css';

}
