"use strict";

import _ from 'lodash';

export default ( tagSet, lang, defaultLang = 'en' ) => {

  const flatten = makeFlatten( lang, defaultLang );

  return {
    groups: tagSet.groups.map( g => ( {
      name: flatten( g.name ),
      info: flatten( g.info ),
      tags: g.tags.map( t => ( { id: t.id, label: flatten( t.label ) } ) )
    } )
  ) };

}

function makeFlatten( lang, defaultLang ) {

  return label => {

    if ( !label || _.isString( label ) ) return label;

    if ( label[ lang ] ) return label[ lang ];

    if ( label[ defaultLang ] ) return label[ defaultLang ];

    return label[ _.first( _.keys( label ) ) ];

  }

}
