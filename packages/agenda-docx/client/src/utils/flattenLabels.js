"use strict";

export default ( labels, lang ) => {

  return Object.keys( labels ).reduce( ( flat, key ) => {

    flat[ key ] = labels[ key ][ lang ];

    return flat;

  }, {} );

}
