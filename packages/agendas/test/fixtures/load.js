"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const knex = require( 'knex' );

module.exports = async ( { mysql, files, map } ) => {

  const k = knex( {
    client: 'mysql',
    connection: _.extend( _.omit( mysql, [ 'database' ] ), { multipleStatements: true } )
  } );

  let raw = files.map( file => fs.readFileSync( file, 'utf-8' ).replace( /;$/, '' ) ).join( ';' ) + ';';

  _.forEach( map, ( value, key ) => {

    raw = raw.replace( new RegExp( '\\${' + key + '}', 'g' ), value );

  } );

  const result = await k.raw( raw );

}