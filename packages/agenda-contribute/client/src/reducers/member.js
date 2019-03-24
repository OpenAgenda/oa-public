import _ from 'lodash';

const UPDATE = 'agenda-contribute/member/UPDATE';

module.exports = _.extend( reducer, {
  updated
} );


function reducer( state = {}, action = {} ) {

  switch ( action.type ) {

    case UPDATE:

      return action.member;

  }

  return state;

}


/**
 * member data update was confirmed by server
 */

function updated( member ) {

  return ( dispatch, getState, history ) => {

    const state = getState();

    const { base } = state.config;

    dispatch( { type: UPDATE, member } );

    return history.push( base + '/event' );

  }

}
