"use strict";

module.exports = {
  what: what,
  passed: passed,
  event: event,
  categories: categories,
  tags: tags,
  organizations: organizations,
  locations: locations,
  dates: dates
}


function what( item, reqParams, whatUids ) {

  if ( reqParams.what ) {

    if ( !whatUids || whatUids.indexOf( parseInt( item.u, 10 ) ) == -1 ) {

      return false;

    }

  }

  return true;

}


function passed( item, reqParams ) {

  var today = new Date();

  today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );

  if ( !reqParams.passed && !reqParams.from ) {

    for ( var i in item.d ) {

      if ( item.d[ i ] >= today ) {

        return true;

      }

    }

    return false;

  }

  return true;

}


function event( item, reqParams ) {
  
  if ( reqParams.uid ) {

    return (item.u + '') == (reqParams.uid + '');

  };

  return true;

}


function categories( item, reqParams ) {

  if ( reqParams.category && ( item.c !== reqParams.category ) ) return false;

  return true;

}


function tags( item, reqParams ) {

  var reqTags;

  if ( !reqParams.tags ) return true;

  reqTags = typeof reqParams.tags == 'string' ? [ reqParams.tags ] : reqParams.tags;

  if ( !reqTags.length ) return true;

  if ( !item.t ) return false;

  for ( var i = reqTags.length - 1; i >= 0; i-- ) {

    if ( item.t.indexOf( reqTags[ i ] ) == -1 ) {

      return false;

    }

  }

  return true;

}


function organizations( item, reqParams ) {

  if ( reqParams.org && ( ( !item.org ) || ( item.org.s !== reqParams.org ) ) ) return false;

  return true;

}


function dates( item, reqParams ) {

  if ( !reqParams.from ) {

    return true;

  }

  var period = [ reqParams.from, reqParams.to ? reqParams.to : reqParams.from ];

  for ( var i in item.d ) {

    if ( ( item.d[ i ] >= period[ 0 ] ) && ( item.d[ i ] <= period[ 1 ] ) ) {

      return true;

    }

  }

  return false;

}


function locations( item, reqParams ) {

  if ( reqParams.location ) {

    return parseInt( reqParams.location, 10 ) == item.l;

  }

  // is one of the locations within square... works most places
  
  if ( reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng ) {

    var ne = [ parseFloat(reqParams.neLat), parseFloat(reqParams.neLng) ], 

    sw = [parseFloat(reqParams.swLat), parseFloat(reqParams.swLng)];

    if ( (item.lt <= ne[0] ) &&

    ( item.lg <= ne[1] ) &&

    ( item.lt >= sw[0] ) &&

    ( item.lg >= sw[1]) ) return true;

    return false;

  }

  return true;

}

function _fZ( n ) {
  return (n>9?'':'0') + n;
};
