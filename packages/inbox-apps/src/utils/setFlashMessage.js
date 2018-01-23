import Cookies from 'js-cookie';

export default function setFlashMessage( message ) {
  const cookiesManager = Cookies.withConverter( {
    read: v => b64DecodeUnicode( v ),
    write: v => b64EncodeUnicode( v )
  } );

  return cookiesManager.set( 'oa.rw', {
    ...cookiesManager.getJSON( 'oa.rw' ),
    flash: message
  } );
}

function b64EncodeUnicode( str ) {
  return btoa( encodeURIComponent( str ).replace(
    /%([0-9A-F]{2})/g,
    ( match, p1 ) => String.fromCharCode( parseInt( p1, 16 ) )
  ) );
}

function b64DecodeUnicode( str ) {
  return decodeURIComponent( Array.prototype.map.call(
    atob( str ),
    c => '%' + ('00' + c.charCodeAt( 0 ).toString( 16 )).slice( -2 )
  ).join( '' ) )
}
