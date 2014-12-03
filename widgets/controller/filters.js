exports.what = function( item, reqParams, whatUids ) {

  if ( reqParams.what ) {

    if ( !whatUids || whatUids.indexOf( parseInt( item.u, 10 ) ) == -1 ) {

      return false;

    }

  }

  return true;

}

exports.event = function( item, reqParams ) {

  if ( reqParams.uid && ( item.u !== reqParams.uid ) ) return false;

  return true;

}

exports.categories = function( item, reqParams ) {

  if ( reqParams.category && ( item.c !== reqParams.category ) ) return false;

  return true;

}


exports.tags = function( item, reqParams ) {

  if ( reqParams.tags ) {

    if ( item.t ) for ( var i = item.t.length - 1; i >= 0; i-- ) {

      if ( reqParams.tags == item.t[i] ) return true;

    }

    return false;

  }

  return true;

}

exports.organizations = function( item, reqParams ) {

  if ( reqParams.org && ( ( !item.org ) || ( item.org.s !== reqParams.org ) ) ) return false;

  return true;

}

exports.locations = function( item, reqParams ) {

  if ( reqParams.location && ( typeof item.l[reqParams.location] == 'undefined' ) ) {

    return false;

  }

  // is one of the locations within square... works most places
  
  if ( reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng ) {

    var ne = [ parseFloat(reqParams.neLat), parseFloat(reqParams.neLng) ], 

    sw = [parseFloat(reqParams.swLat), parseFloat(reqParams.swLng)];

    for ( var i in item.l ) {

      if ( (item.l[i].lt <= ne[0] ) &&

      ( item.l[i].lg <= ne[1] ) &&

      ( item.l[i].lt >= sw[0] ) &&

      ( item.l[i].lg >= sw[1]) ) return true;

    }

    return false;

  }

  return true;

}