"use strict";

import _ from 'lodash';

export default ( field, values ) => {

  if ( !field.enableWith ) return {};

  return _.pick( values, [ field.enableWith ] );

}
