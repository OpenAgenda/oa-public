import update from 'immutability-helper'

export default ( state = {}, action ) => {

  switch( action.type ) {

    case 'EVENTS_REQUEST':

      return update( state, {
        loading: { $set: true },
        events: []
      } );

      break;

    case 'EVENTS_SUCCESS':

      return update( state, {
        loading: { $set: false },
        events: { $set: action.events.map( e => ( {
          uid: e.uid,
          title: e.title[ state.lang ],
          dateRange: e.dateRange[ state.lang ],
          location: {
            name: e.location.name,
            address: e.location.address
          }
        } ) ) },
        error: { $set: false }
      } );

      break;

    case 'EVENTS_FAILED':

      return update( state, {
        loading: { $set: false },
        events: { $set: [] },
        error: { $set: action.error }
      } );

      break;

    case 'EVENT_REMOVE':

      let removedEventIndex = state.events.map( e => e.uid ).indexOf( action.eventUid );

      if ( removedEventIndex == -1 ) {

        return state;

      }

      return update( state, {
        events: {
          $splice: [ [ removedEventIndex, 1 ] ]
        }
      } );

    case 'EVENT_ADD':

      if ( state.events.map( e => e.uid ).indexOf( action.event.uid ) !== -1 ) {

        return state;

      }

      return update( state, {
        search: {
          searching: {
            $set: false
          },
          display: {
            $set: false
          },
          query: {
            $set: false
          },
          events: {
            $set: []
          }
        },
        events: {
          $push: [ action.event ]
        }
      } );

    default:

      return state;

  }

}
