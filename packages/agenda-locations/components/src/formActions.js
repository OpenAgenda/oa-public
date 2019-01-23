import utils from '@openagenda/utils';
import update from 'immutability-helper';
import onTranslationCheck from '@openagenda/react-form-components/lib/onTranslationCheck';

const alternativeFields = [ 'name', 'address', 'description', 'access', 'phone', 'website', 'latitude', 'longitude', 'countryCode' ];

module.exports = actions;

module.exports.tests = {
  initialize,
  loadAlternative,
  loadTagAlternative,
  checkLanguage,
  startPageSpin,
  stopPageSpin,
  showExtId
}


function actions( options ) {

  let {getState, setState} = utils.extend( {
    setState: function() {}, // state setter
    getState: function() {}
  }, options );

  return {

    // not actually an action
    getState,

    initialize,

    loadAlternative: assign( loadAlternative ),

    loadTagAlternative: assign( loadTagAlternative ),

    checkLanguage: assign( checkLanguage ),

    sourceLanguageChange: assign( sourceLanguageChange ),

    startPageSpin: assign( startPageSpin ),

    stopPageSpin: assign( stopPageSpin ),

    setError: assign( setError ),

    setStart: assign( setStart ),

    setErrorResponse: assign( setErrorResponse ),

    setSuccess: assign( setSuccess ),

    showExtId: assign( showExtId )

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

    }

  }

}


function initialize( props ) {

  const state = {
    location: {},
    autoGeocode: true,
    showGeocodeLink: false,
    geocodeLoading: false,
    enableGeocode: props.enableGeocode,
    loadingError: false,
    errors: false,
    geocodeError: false,
    activeAlternatives: {},
    translation: {},
    pageSpin: null,
    showExtIdInput: false
  }


  state.location = {};

  for( const f in props.location ) {

    state.location[ f ] = props.location[ f ];

  }

  if ( !state.location.countryCode ) {

    state.location.countryCode = props.settings && props.settings.defaultCountryCode ? props.settings.defaultCountryCode : 'FR';

  }

  if ( !state.enableGeocode && !state.location.latitude) {

    state.location.latitude = 40.844954;
    state.location.longitude = 4.289467;

  }

  if ( props.settings && props.settings.translation ) {

    state.translation = props.settings.translation;

  }

  if ( props.alternatives ) {

    let loadIndex = -1;

    props.alternatives.forEach( ( s, i ) => {

      // if alternative has same uid as loaded, is considered to
      // be loaded
      if ( s.location.uid === props.location.uid ) {

        loadIndex = i;

      }

      // if alternative is preset to be loaded, it is loaded.
      if ( s.preload ) {

        loadIndex = i;

      }

    } );

    if ( loadIndex !== -1 ) {

      alternativeFields.forEach( f => {

        if ( props.alternatives[ loadIndex ][ f ] !== 'undefined' ) {

          state.activeAlternatives[ f ] = loadIndex;

          state.location[ f ] = props.alternatives[ loadIndex ].location[ f ];

        }

      } );

    }

  }

  return state;

}


/**
 * load tag suggestion
 */

function loadTagAlternative( state, tag, check ) {

  let changes = {},

  isChecked = state.location.tags.filter( t => t.id === tag.id ).length;

  if ( check && !isChecked ) {

    changes.location = {
      tags: {
        $push: [ tag ]
      }
    }

  } else if ( !check && isChecked ) {

    changes.location = {
      tags: {
        $set: state.location.tags.filter( t => t.id !== tag.id )
      }
    }

  }

  return update( state, changes );

}


function setError( state, errors ) {

  return {
    errors,
    pageSpin: null,
    loadingError: false
  }

}

function setStart( state, message ) {

  return {
    errors: false,
    loadingError: false,
    pageSpin: {
      message
    }
  }

}

function setErrorResponse( state, message ) {

  return {
    loadingError: message,
    pageSpin: false
  }

}

function setSuccess( state, location ) {

  let change = {
    loadingError: false,
    pageSpin: false,
  }

  if ( location ) {

    change.location = location;

  }

  return change;

}



/**
 * start page spin
 */
function startPageSpin( state, message = null ) {

  return { pageSpin: { message } };

}

function stopPageSpin( state ) {

  return { pageSpin: false };

}

function showExtId() {

  return { showExtIdInput: true };
}


/**
 * check or uncheck language in translation list
 */
function checkLanguage( state, check, source, language ) {

  return {
    translation: onTranslationCheck( state.translation, check, language )
  }

}

function sourceLanguageChange( state ) {

  console.log( arguments[ 1 ] );
  console.log( arguments[ 2 ] );

}


/**
 * load suggestion in current location value
 *
 * @param object state              the current state
 * @param object alternatives       alternatives to current value
 * @param string fieldName          currently processed field name
 * @param integer alternativeIndex  index of alternative to load as current value
 * @param array pasteNames          if fields to swap are different from fieldName field
 */

function loadAlternative( state, alternatives, fieldName, alternativeIndex, lang, pasteNames ) {

  if ( arguments.length === 5 ) {

    pasteNames = lang;
    lang = false;

  }

  let updated = {
    location: {},
    activeAlternatives: {}
  };

  // update active suggestion index

  updated.activeAlternatives[ fieldName ] = {
    $set: alternativeIndex
  }


  // update loaded values

  if ( !pasteNames ) {

    pasteNames = [ fieldName ];

  }

  pasteNames.forEach( name => {

    if ( lang ) {

      updated.location[ name ] = {};

      updated.location[ name ][ lang ] = {
        $set: alternatives[ alternativeIndex ].location[ name ][ lang ]
      };

    } else {

      updated.location[ name ] = {
        $set: alternatives[ alternativeIndex ].location[ name ]
      };

    }

  } );

  return update( state, updated );

}
