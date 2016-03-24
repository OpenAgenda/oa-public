"use strict";

module.exports = {
  getSwapIndex: getSwapIndex,
  isSame: isSame
}


/**
 * if one language has changed but order and count
 * has remained the same, then the operation is
 * a language swap
 */
function getSwapIndex( l1, l2 ) {

  var changeIndexes = [];

  if ( l1.length !== l2.length ) {

    return -1;

  }

  for ( var i = l1.length - 1; i >= 0; i-- ) {

    if ( l1[ i ] !== l2[ i ] ) changeIndexes.push( i );

  }

  // we are interested in one swap; not more
  if ( changeIndexes.length !== 1 ) {

    return -1;

  }

  return changeIndexes[ 0 ];

}

//http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
function isSame( a, b ) {

  // if the other array is a falsy value, return
  if ( !a ) return false;

  // compare lengths - can save a lot of time
  if ( b.length != a.length ) return false;

  for ( var i = 0; i < b.length; i++ ) {

    // Check if we have nested arrays
    if ( b[i] instanceof Array && a[i] instanceof Array ) {

      // recurse into the nested arrays
      if ( !b[i].compare( a[i] ) ) {

        return false;

      }

    }
    else if ( b[i] != a[i] ) {

      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;

    }
  }
  return true;

}

