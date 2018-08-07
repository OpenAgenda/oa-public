"use strict";

import ih from 'immutability-helper';


/**
 * state is distributed along reducer groups ( member, event, confirmation ).
 * But some configurations, like app current language have to be accessed
 * on all components. At init an additional key is loaded in state for that purpose.
 * This function merges this with component props at connect
 */
module.exports = ( state, current ) => {

  return ih( state[ current ], { config: { $set: state.config } } );

}