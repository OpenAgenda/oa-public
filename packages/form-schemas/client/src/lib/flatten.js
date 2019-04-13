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

    const optionsUpdate = field.options.reduce( ( optionsUpdate, o, i ) => {

      if ( _.isString( o.label ) ) return optionsUpdate;

      return _.set( optionsUpdate, i, {
        label: {
          $set: _.get(
            o.label,
            lang,
            _.get( o.label, _.first( _.keys( o.label ) ) )
          )
        }
      } );

    }, {} );

    if ( _.keys( optionsUpdate ).length ) update.options = optionsUpdate;

  }

  return ih( field, update );

}
