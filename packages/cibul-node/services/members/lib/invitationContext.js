"use strict";

const _ = require( 'lodash' );

module.exports = ( invitation, defaultContext = null ) => {
  const action = _.get(
    invitation,
    'data.actions',
    []
  ).find( v => v.name === 'linkMember' );

  return _.get( action, 'params.1', defaultContext ); // message is in there
}

module.exports.getLang = ( invitation, defaultLang = 'fr' ) => {
  const context = module.exports( invitation );
  return _.get( context, 'lang', defaultLang );
}
