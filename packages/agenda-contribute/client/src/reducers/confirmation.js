import _ from 'lodash';

module.exports = _.extend( reducer, {
  redirect
} );


function reducer( state = {}, action = {} ) {

  return state;

}


function redirect( type ) {

  return ( dispatch, getState ) => {

    const state = getState();

    window.location.href = _.get( state, 'config.redirects.' + type )
      .replace( ':eventUid', _.get( state, 'event.uid' ) );

  }

}
