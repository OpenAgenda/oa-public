import _ from 'lodash';

export default ( values, defaultLang ) => {

  if ( !_.isObject( values ) ) {

    return [ defaultLang ];

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

  return [ defaultLang ];

}
