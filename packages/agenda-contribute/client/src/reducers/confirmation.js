import _ from 'lodash';
import ih from 'immutability-helper';

module.exports = _.extend( reducer, {
  redirect
} );


function reducer( state = {}, action = {} ) {

  return state;

}


function redirect( type ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const redirect = _.get( state , 'config.redirects.' + type );

    if ( [ 'contactAdministrators','seeEvent' ].includes( type ) ) {

      window.location.href = redirect.replace( ':eventUid', _.get( state, 'event.uid' ) );

      return;

    }

    window.location.href = redirect;

  }

}
