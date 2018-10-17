"use strict";

import _ from 'lodash';

export default ( field, values ) => {

  if ( !field.related ) return {};

  return _.pick( values, [].concat( field.related ) );

}
