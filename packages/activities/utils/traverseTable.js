"use strict";

const async = require( 'async' );

module.exports = function ( knex, table, queryModifier, eachCb, cb ) {

  let rowsCount = 0;
  let rowsAffected = 0;

  async.doWhilst(
    dcb => {

      const query = knex( table ).offset( rowsAffected ).limit( 100 );

      queryModifier( query )
        .then( rows => {

          rowsCount = rows.length;
          rowsAffected += rows.length;

          if ( !rows.length ) return dcb();

          async.eachOfSeries( rows, ( item, i, ecb ) => {
            eachCb( item, rowsAffected - rows.length + Number.parseInt( i ), ecb );
          }, dcb );

        } );

    },
    () => rowsCount > 0,
    err => {

      cb( err, rowsAffected );

    }
  );

};
