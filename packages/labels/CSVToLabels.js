"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const { loadCSVData } = require( './lib/helpers' );

const { term } = require( './lib/prompt' );

( async () => {

  try {

    const labelsBasePath = __dirname + '/';

    const inputFilePath = await term( 'Where is the csv file?' );

    const translatedLabels = await loadCSVData( inputFilePath, { delimiter: ',' } );

    const perFilePaths = _distributePerFilePaths( labelsBasePath, translatedLabels );

    perFilePaths.forEach( ( { labels, path } ) => {

      fs.writeFileSync( path, _defineModuleContent( _populate( require( path ), labels ) ) );

    } );

  } catch ( e ) {

    console.log( e );

  }

} )();


function _populate( reference, translated ) {

  const update = {}

  // translate
  _.keys( reference )
    .filter( code => translated[ code ] )
    .forEach( code => {

      const current = reference[ code ];

      // define currently existing labels
      const set = _.keys( current )
        .reduce( ( set, lang ) => _.set( set, lang, translated[ code ][ lang ] || current[ lang ] ), {} );

      // add new
      _.keys( translated[ code ] )
        .filter( lang => !_.keys( current ).includes( lang ) )
        .forEach( lang => {

          set[ lang ] = translated[ code ][ lang ];

        } );

    update[ code ] = { $set: set };

  } );

  return ih( reference, update );

}


function _defineModuleContent( labels ) {

  return `"use strict";

module.exports = ${JSON.stringify( labels, null, 2 )}
`;

}

function _distributePerFilePaths( baseLabelPath, translatedLabels ) {

  return translatedLabels.reduce( ( grouped, labelSet ) => {

    const path = baseLabelPath + labelSet.group.replace( '.', '/' ) + '.js';

    const index = _.findIndex( grouped, [ 'path', path ] );

    const label = _.keys( labelSet )
      // keep lang keys only
      .filter( k => ![ 'group', 'label' ].includes( k ) )
      // make label obj with lang keys
      .reduce( ( label, lang ) => _.set( label, lang, labelSet[ lang ] ), {} );

    const labelCode = labelSet.label.substr( labelSet.group.length + 1 );

    if ( index === -1 ) {

      grouped.push( {
        path,
        labels: _.set( {}, labelCode, label )
      } );

    } else {

      grouped[ index ].labels[ labelCode ] = label;

    }

    return grouped;

  }, [] );

}
