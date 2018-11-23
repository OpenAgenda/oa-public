import update from 'immutability-helper';
import utils from '@openagenda/utils';
import dl from '@openagenda/dom-utils/documentLocation';

// little counter
function _syncCounter() {

  if ( typeof window === 'undefined' ) return;

  if ( !window.oa || !window.oa.verifiedLocationsCounter ) return;

  setTimeout( () => {

    window.oa.verifiedLocationsCounter();

  }, 1000 );

}

module.exports = actions;

module.exports.updateSearchQuery = updateSearchQuery;

module.exports.tests = {
  updateEditedLocation,
  addLocation,
  newLocation,
  closeForm,
  closeMerge,
  toggleMerge,
  toggleMergeItem,
  launchMerge,
  updateLocationList,
  editLocation,
  removedLocation,
  getQuery,
  queryChange,
  displayRemoveConfirmModal,
  closeModal
}


function actions( options ) {

  let {getState, setState} = utils.extend( {
    setState: function() {}, // state setter
    getState: function() {}
  }, options );

  return {

    // not actually an action
    getState,

    editLocation: assign( editLocation ),

    updateEditedLocation: assign( updateEditedLocation ),
    newLocation: assign( newLocation ),
    addLocation: assign( addLocation ),
    removedLocation: assign( removedLocation ),
    closeForm: assign( closeForm ),

    closeMerge: assign( closeMerge ),
    toggleMerge: assign( toggleMerge ),
    launchMerge: assign( launchMerge ),

    updateLocationList: assign( updateLocationList ),
    toggleMergeItem: assign( toggleMergeItem ),

    queryChange: assign( queryChange ),

    getQuery,

    displayRemoveConfirmModal: assign( displayRemoveConfirmModal ),
    closeModal: assign( closeModal )

  }


  /**
   * simplifies stateless testing. calls
   * input function by prepending current state
   * and applies value as new state
   */

  function assign( fn ) {

    return function( ...args ) {

      let state = getState(),

      newState = fn( ...[ state ].concat( args ) );

      setState( newState );

      return newState;

    }

  }

}


function removedLocation( state, index ) {

  _syncCounter();

  return update( state, {
    locations: { $splice: [[ index, 1 ]] },
    modal: {
      data: {
        isRemoved: { $set: true }
      }
    }
  } );

}


function editLocation( state, location, locationIndex ) {

  return update( state, {
    form: {
      $set: {
        location: location,
        locationIndex: locationIndex
      }
    }
  } );

}


function updateLocationList( state, locations, total, page ) {

  _syncCounter();

  return {
    locations,
    total,
    page
  }

}


function closeForm( state, location ) {

  let updatedState = {
    locations: {}
  }

  updatedState.form = { $set: false };

  // if an image was uploaded before form was closed,
  // image must be updated
  if ( state.form && state.form.locationIndex ) {

    updatedState.locations[ state.form.locationIndex ] = {
      image: { $set: location.image }
    }

  }

  return update( state, updatedState );

}


function newLocation( state ) {

  return update( state, {
    form: { $set: {} }
  } );

}


function addLocation( state, location ) {

  _syncCounter();

  return update( state, {
    locations: { $splice: [ [ 0, 0, location ] ] },
    form: { $set: false }
  } );

}

/**
 * add or remove location item from
 * merge list
 */

function toggleMergeItem( state, location ) {

  let locationUids = state.merge.locationUids.concat(),

  index = locationUids.indexOf( location.uid );

  if ( index == -1 ) {

    locationUids.push( location.uid );

  } else {

    locationUids.splice( index, 1 );

  }

  return {
    merge: {
      locationUids: locationUids
    }
  }

}


/**
 * update a location in general location list.
 * Optionnally, close the form
 */
function updateEditedLocation( state, location, closeForm ) {

  let updatedState = {
    locations: {}
  };

  if ( closeForm ) {

    updatedState.form = { $set: false };

  }

  updatedState.locations[ state.form.locationIndex ] = { $set: location };

  _syncCounter();

  return update( state, updatedState );

}


function launchMerge( state, mergedLocations ) {

  return update( state, {
    merge: {
      $set: state.merge || true
    },
    form: {
      $set: {
        location: mergedLocations[ 0 ],
        alternatives: mergedLocations.map( ( l, i ) => ( {
          location: l
        } ) )
      }
    }
  } );

}


function closeMerge( state ) {

  return update( state, {
    merge: { $set: false },
    form: { $set: false },
    query: { $set: {} },
    locations: { $set: [] }
  } );

}


/**
 * toggle merge mode on or off
 * used in AgendaAdminLocations
 */
function toggleMerge( state, on ) {

  if ( on ) {

    return {
      merge: {
        locationUids: []
      }
    }

  } else {

    return {
      merge: false
    }

  }

}


function updateSearchQuery( current, field, newSearchValue ) {

  var query = JSON.parse( JSON.stringify( current || {} ) );

  if ( typeof newSearchValue == 'string' && !newSearchValue.length ) {

    newSearchValue = undefined;

  }

  if ( newSearchValue === undefined ) {

    if ( query[ field ] !== undefined ) delete query[ field ];

  } else {

    query[ field ] = newSearchValue;

  }

  return query;

}


function queryChange( state, query ) {

  dl.setQueryPart( query );

  return {
    query: query
  }

}


function getQuery() {

  // query reference is in url now.
  return dl.getQuery() || {};

}



function displayRemoveConfirmModal( state, location, index ) {

  return {
    modal: {
      type: 'removeLocation',
      data: {
        location: location,
        index: index
      }
    }
  }

}

function closeModal( state ) {

  return {
    modal: false
  }

}
