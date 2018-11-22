import _ from 'lodash';

export default function ( before, after ) {

  if ( !after ) return [];

  const addedLanguages = _.difference( after, before );

  return {
    addedLanguages,
    removedLanguages: _.difference( before, after ),
    changedLanguages: ( before.length === after.length && addedLanguages.length ) ? addedLanguages : []
  }

}
