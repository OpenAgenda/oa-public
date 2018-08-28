"use strict";

import _ from 'lodash';
import extractLanguages from './extractLanguages';

module.exports = ( before, after ) => {

  const addedLanguages = _.difference( after, before );

  return {
    addedLanguages,
    removedLanguages: _.difference( before, after ),
    changedLanguages: ( before.length === after.length && addedLanguages.length ) ? addedLanguages : []
  }

}
