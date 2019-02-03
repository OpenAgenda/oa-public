"use strict";

const _ = require( 'lodash' );
const walk = require( 'walk' );

const { writeCSVFile } = require( './lib/helpers' );

const { term } = require( './lib/prompt' );

( async () => {

  const labelsBasePath = __dirname;

  const files = await listAllLabelFiles( labelsBasePath );

  const rows = [];

  for ( const file of files ) {

    const labelSet = {
      key: file.key,
      labels: require( file.path )
    };

    const rowGroup = _.keys( labelSet.labels ).reduce( ( rows, labelCode ) => {

      return rows.concat( _.assign( {
        group: labelSet.key,
        label: labelSet.key + '.' + labelCode
      }, labelSet.labels[ labelCode ] ) );

    }, [] );

    rowGroup.forEach( r => rows.push( r ) );

  }

  const outPath = await term( 'Specify the path and name of the csv to be generated', { default: '/var/tmp' } );

  const outName = await term( 'Specify the name', { default: 'labels-' + JSON.stringify( new Date ).replace( /"/g, '' ) + '.csv' } );

  await writeCSVFile( outPath + '/' + outName, rows );

} )();


function listAllLabelFiles( path ) {

  return new Promise( rs => {

    const files = [];

    const walker = walk.walk( path, { followLinks: false } );

    walker.on( 'file', ( root, stat, next ) => {

      // files at root are not label files
      if ( root === path ) return next();

      const pathParts = root.split( '/' );

      if ( pathParts.includes( 'node_modules' ) ) return next();

      // we don't want test files
      if ( pathParts.pop() === 'test' ) return next();

      files.push( {
        path: root + '/' + stat.name,
        key: root.substr( path.length + 1 ).split( '/' ).concat( stat.name.split( '.' ).shift() ).join( '.' )
      } );

      next();

    } );

    walker.on( 'end', () => {

      rs( files );

    } );

  } )

}
