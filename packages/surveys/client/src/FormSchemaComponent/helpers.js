"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';


export function flatten( field, lang ) {

  const update = {};

  [ 'label', 'info', 'placeholder' ].forEach( f => {

    if ( !field[ f ] ) return;

    update[ f ] = { $set: _.get( field[ f ], lang ) };

  } );

  if ( field.options ) {

    update.options = field.options.reduce( ( optionsUpdate, o ) => {

      return optionsUpdate.concat( { label: { $set: _.get( o.label, lang ) } } );

    }, [] );

  }

  return ih( field, update );

}
