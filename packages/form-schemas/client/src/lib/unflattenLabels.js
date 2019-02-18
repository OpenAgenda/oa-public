import _ from 'lodash';
import ih from 'immutability-helper';

export default ( field, languages ) => {

  return ih( field, [ 'label', 'info', 'sub', 'placeholder' ]
    .filter( labelField => _.isString( field[ labelField ] ) )
    .reduce( ( updates, f ) => _.set( updates, f, {
      $set: languages.reduce( ( fieldValues, lang ) => _.set( fieldValues, lang, field[ f ] ), {} )
    } ), {} ) );

}
