import _ from 'lodash';
import ih from 'immutability-helper';

module.exports = ( field, lang ) => {

  if ( !field ) return null;

  const update = {};

  [ 'label', 'info', 'placeholder', 'sub', 'help' ].forEach( f => {

    if ( !field[ f ] ) return;

    if ( _.isString( field[ f ] ) ) return field[ f ];

    update[ f ] = {
      $set: _.get(
        field[ f ],
        lang,
        field[ f ][ _.first( _.keys( field[ f ] ) ) ]
      )
    };

  } );

  if ( field.options ) {

    update.options = field.options.reduce( ( optionsUpdate, o ) => {

      return optionsUpdate.concat( { label: { $set: _.get( o.label, lang, _.get( o.label, _.first( _.keys( o.label ) ) ) ) } } );

    }, [] );

  }

  return ih( field, update );

}
