import _ from 'lodash';
import isMemberValid from '../lib/isMemberValid';

module.exports = _.extend( reducer, {
  evaluate
} );


function reducer( state = {}, action = {} ) {

  return state;

}


/**
 * define which screen should be shown
 */
function evaluate( step, requested = false ) {

  return ( dispatch, getState, history ) => {

    const state = getState();

    const {
      base,
      member: memberConfig,
      edit
    } = state.config;

    const draftEvent = _.get( state, 'event.draft', false );
    const eventEdition = edit && !draftEvent;

    if ( eventEdition && step === 'edit' ) {

      // we are in the right place
      return;

    } else if ( eventEdition ) {

      return history.push( base + '/event/' + state.event.uid );

    }

    // we are handling a new or a draft event

    const requestedRoute = base + '/' + step + ( step === 'event' && draftEvent ? `/${_.get( state, 'event.uid' )}/draft` : '' );

    const authorizedRoutes = [ base + '/member' ];

    if ( !memberConfig.dataIsRequired || isMemberValid( state.member ) ) {

      authorizedRoutes.push( base + (
        draftEvent ? `/event/${_.get( state, 'event.uid' )}/draft` : '/event'
      ) );

    }

    if ( _.get( state, 'event.uid' ) && !draftEvent ) {

      authorizedRoutes.push( base + '/confirmation' );

    }

    if ( !step || !authorizedRoutes.includes( requestedRoute ) ) {

      history.push( authorizedRoutes.pop() );

    } else if ( requested ) {

      history.push( requestedRoute );

    }

  }

}
