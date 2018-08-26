"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';

module.exports = {
  flatten
}

function flatten( field, lang ) {

  const update = {};

  [ 'label', 'info', 'placeholder', 'sub' ].forEach( f => {

    if ( !field[ f ] ) return;

    if ( _.isString( field[ f ] ) ) return field[ f ];

    update[ f ] = { $set: _.get( field[ f ], lang ) };

  } );

  if ( field.options ) {

    update.options = field.options.reduce( ( optionsUpdate, o ) => {

      return optionsUpdate.concat( { label: { $set: _.get( o.label, lang ) } } );

    }, [] );

  }

  return ih( field, update );

}
