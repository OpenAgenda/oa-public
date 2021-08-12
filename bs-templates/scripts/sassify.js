"use strict";

const path = require( 'path' );
const fs = require( 'fs' );
const sass = require( 'node-sass' );
const importOnce = require( 'node-sass-import-once' );
let pnp;

try {
  pnp = require('pnpapi');
} catch (error) { // pnpapi is not defined
  pnp = null;
}

module.exports = createCss;

module.exports.render = render;

function createCss( filename, cb ) {

  if ( !/\.scss$/.test( filename ) ) return cb ? cb() : null;

  render( filename, ( err, rendered ) => {

    if ( err ) {

      console.log( filename.yellow + ': ' + err.message.red );

      return cb ? cb( err ) : null;

    }

    fs.writeFile( filename.replace( '.scss', '.css' ), rendered, cb ? cb : () => {
    } );

  } );

}

function avoidError(fn, ...args) {
  try {
    return fn(...args);
  } catch (e) {
    return null;
  }
}

function importer(uri, prev, done) {
  const extensions = ['.scss', '.sass', '.css'];

  const uriParts = uri.split('/');
  const lastPart = uriParts.pop();
  const alternativeLastPart = `_${lastPart}`;
  const alternativeUri = [...uriParts, alternativeLastPart].join('/');

  const relativisedUri = path.isAbsolute(uri) || uri[0] === '.' || uri[0] === '/'
    ? null
    : `./${uri}`;
  const relativisedAlternativeUri = path.isAbsolute(uri) || uri[0] === '.' || uri[0] === '/'
    ? null
    : `./${alternativeUri}`;

  const joined = path.join(path.dirname(prev), uri);
  const alternativeJoined = path.join(path.dirname(prev), alternativeUri);

  const uris = [
    joined,
    alternativeJoined,
    uri, // neededFile
    alternativeUri, // _neededFile
    relativisedUri, // ./neededFile
    relativisedAlternativeUri // ./_neededFile,
  ];
  let resolution;

  for (const uriToTest of uris) {
    if (!uriToTest) {
      continue;
    }

    // const result = pnp
    //   ? avoidError(pnp.resolveRequest, uriToTest, path.dirname(prev), {
    //     extensions,
    //     considerBuiltins: false
    //   })
    //   : avoidError(resolve.sync, uriToTest, {
    //     basedir: path.dirname(prev),
    //     extensions
    //   });

    const result = avoidError(pnp.resolveRequest, uriToTest, path.dirname(prev), {
      extensions,
      considerBuiltins: false
    });

    if (result && extensions.includes(path.extname(result))) {
      resolution = result;
      break;
    }
  }

  importOnce.call(this, resolution || uri, prev, done);
}

// function importer(uri, prev, done) {
//   let resolution;
//   let pnpError;
//
//   try {
//     resolution = pnp.resolveToUnqualified(uri, prev, { considerBuiltins: false });
//   } catch (error) {
//     pnpError = error;
//   }
//
//   importOnce.call(this, resolution || uri, prev, result => {
//     const keys = Object.keys(result);
//
//     if (keys.length) {
//       return done(result);
//     }
//
//     if (pnpError) {
//       console.log(pnpError);
//     }
//
//     return importOnce.call(this, uri, prev, done);
//   });
// }

function render( filename, cb ) {

  console.log( filename );

  sass.render( {
    file: filename,
    importer: pnp ? importer : importOnce,
    includePaths: pnp
      ? []
      : [
        path.resolve( __dirname, '..' ),                      // bs-templates
        path.resolve( __dirname, '../node_modules' ),         // bs-templates node_modules
        path.resolve( __dirname, '../../../node_modules' )    // oa root node_modules
      ]
  }, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result.css.toString() );

  } );

}
