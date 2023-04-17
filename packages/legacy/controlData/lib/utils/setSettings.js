"use strict";

const _ = require( 'lodash' );
const VError = require( '@openagenda/verror' );

module.exports = ( ctl, agenda ) => {

  let settings;

  try {

    settings = JSON.parse( agenda.settings );

  } catch( e ) {

    throw new VError( 'could not parse agenda settings', agenda );

  }

  ctl.c = _.get( settings, 'contribution.type' );

  ctl.prv = !!agenda.private;

}
