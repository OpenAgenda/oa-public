import _ from 'lodash';

/**
 * derive defined languages from current form data
 */

export default ( values, defaultLang = null ) => {

  if ( !_.isObject( values ) ) {

    return defaultLang ? [ defaultLang ] : [];

  }

  const languages = _.uniq( [
    'title',
    'description',
    'keywords',
    'conditions'
  ].reduce( ( languages, field ) => {

    return _.isObject( values[ field ] )
      ? languages.concat( _.keys( values[ field ] ) )
      : languages;

  } , []) );

  if ( languages.length ) return languages;

  return defaultLang ? [ defaultLang ] : [];

}
