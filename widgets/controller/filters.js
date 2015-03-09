module.exports = {
  what: what,
  //passed: passed,
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

  if ( !reqParams.passed && !reqParams.from ) {

    for ( var i in item.l ) {

      for ( var j in item.l[i].d ) {

        if ( item.l[i].d[j] >= today ) {

          return true;

        }

      }

    }

    return false;

  }

  return true;

}


function event( item, reqParams ) {

  if ( reqParams.uid && ( item.u !== reqParams.uid ) ) return false;

  return true;

}


function categories( item, reqParams ) {

  if ( reqParams.category && ( item.c !== reqParams.category ) ) return false;

  return true;

}


function tags( item, reqParams ) {

  if ( reqParams.tags ) {

    if ( item.t ) for ( var i = item.t.length - 1; i >= 0; i-- ) {

      if ( reqParams.tags == item.t[i] ) return true;

    }

    return false;

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

  for ( var i in item.l ) {

    for ( var j in item.l[ i ].d ) {

      if ( ( item.l[ i ].d[ j ] >= reqParams.from ) && ( item.l[ i ].d[ j ] <= reqParams.to ) ) {

        return true;

      }

    }

  }

  return false;

}


function locations( item, reqParams ) {

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

function _fZ( n ) {
  return (n>9?'':'0') + n;
};