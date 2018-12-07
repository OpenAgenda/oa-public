"use strict";

module.exports = a => {

  if ( /(t|T)est/.test( a.title ) ) return false;

  if ( /(t|T)est/.test( a.description ) ) return false;

  return a.publishedEvents || a.official;

}
