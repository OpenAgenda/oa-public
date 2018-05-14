"use strict";

const _ = require( 'lodash' );

const reduceBy = require( './reduceBy' );

module.exports = reduceByDeep;

function reduceByDeep( items, deepReduceByOptions = [] ) {

  const reduceByOptions = deepReduceByOptions[ 0 ];

  const remainingOptions = deepReduceByOptions.slice( 1 );

  const reducedItems = reduceBy( items, reduceByOptions.key, reduceByOptions );

  if ( !remainingOptions.length ) {

    return reducedItems;

  }

  return reducedItems.map( item => {

    item[ reduceByOptions.childrenKey ] = reduceByDeep( item[ reduceByOptions.childrenKey ], remainingOptions );

    return item;

  } );

}