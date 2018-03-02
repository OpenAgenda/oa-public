"use strict";

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _onTranslationCheck = require('@openagenda/react-form-components/lib/onTranslationCheck');

var _onTranslationCheck2 = _interopRequireDefault(_onTranslationCheck);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var alternativeFields = ['name', 'address', 'description', 'access', 'phone', 'website', 'latitude', 'longitude', 'countryCode'];

module.exports = actions;

module.exports.tests = {
  initialize: initialize,
  loadAlternative: loadAlternative,
  loadTagAlternative: loadTagAlternative,
  checkLanguage: checkLanguage,
  startPageSpin: startPageSpin,
  stopPageSpin: stopPageSpin
};

function actions(options) {
  var _utils$extend = _utils2.default.extend({
    setState: function setState() {}, // state setter
    getState: function getState() {}
  }, options),
      getState = _utils$extend.getState,
      setState = _utils$extend.setState;

  return {

    // not actually an action
    getState: getState,

    initialize: initialize,

    loadAlternative: assign(loadAlternative),

    loadTagAlternative: assign(loadTagAlternative),

    checkLanguage: assign(checkLanguage),

    sourceLanguageChange: assign(sourceLanguageChange),

    startPageSpin: assign(startPageSpin),

    stopPageSpin: assign(stopPageSpin),

    setError: assign(setError),

    setStart: assign(setStart),

    setErrorResponse: assign(setErrorResponse),

    setSuccess: assign(setSuccess)

    /**
     * simplifies stateless testing. calls
     * input function by prepending current state
     * and applies value as new state
     */

  };function assign(fn) {

    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var state = getState(),
          newState = fn.apply(undefined, _toConsumableArray([state].concat(args)));

      setState(newState);
    };
  }
}

function initialize(props) {

  var state = {
    location: {},
    autoGeocode: true,
    showGeocodeLink: false,
    geocodeLoading: false,
    loadingError: false,
    errors: false,
    geocodeError: false,
    activeAlternatives: {},
    translation: {},
    pageSpin: null
  };

  state.location = {};

  for (var f in props.location) {

    state.location[f] = props.location[f];
  }

  if (!state.location.countryCode) {

    state.location.countryCode = props.settings && props.settings.defaultCountryCode ? props.settings.defaultCountryCode : 'FR';
  }

  if (props.settings && props.settings.translation) {

    state.translation = props.settings.translation;
  }

  if (props.alternatives) {

    var loadIndex = -1;

    props.alternatives.forEach(function (s, i) {

      // if alternative has same uid as loaded, is considered to
      // be loaded
      if (s.location.uid === props.location.uid) {

        loadIndex = i;
      }

      // if alternative is preset to be loaded, it is loaded.
      if (s.preload) {

        loadIndex = i;
      }
    });

    if (loadIndex !== -1) {

      alternativeFields.forEach(function (f) {

        if (props.alternatives[loadIndex][f] !== 'undefined') {

          state.activeAlternatives[f] = loadIndex;

          state.location[f] = props.alternatives[loadIndex].location[f];
        }
      });
    }
  }

  return state;
}

/**
 * load tag suggestion
 */

function loadTagAlternative(state, tag, check) {

  var changes = {},
      isChecked = state.location.tags.filter(function (t) {
    return t.id === tag.id;
  }).length;

  if (check && !isChecked) {

    changes.location = {
      tags: {
        $push: [tag]
      }
    };
  } else if (!check && isChecked) {

    changes.location = {
      tags: {
        $set: state.location.tags.filter(function (t) {
          return t.id !== tag.id;
        })
      }
    };
  }

  return (0, _immutabilityHelper2.default)(state, changes);
}

function setError(state, errors) {

  return {
    errors: errors,
    pageSpin: null,
    loadingError: false
  };
}

function setStart(state, message) {

  return {
    errors: false,
    loadingError: false,
    pageSpin: {
      message: message
    }
  };
}

function setErrorResponse(state, message) {

  return {
    loadingError: message,
    pageSpin: false
  };
}

function setSuccess(state, location) {

  var change = {
    loadingError: false,
    pageSpin: false
  };

  if (location) {

    change.location = location;
  }

  return change;
}

/**
 * start page spin
 */
function startPageSpin(state) {
  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


  return { pageSpin: { message: message } };
}

function stopPageSpin(state) {

  return { pageSpin: false };
}

/**
 * check or uncheck language in translation list
 */
function checkLanguage(state, check, source, language) {

  return {
    translation: (0, _onTranslationCheck2.default)(state.translation, check, language)
  };
}

function sourceLanguageChange(state) {

  console.log(arguments[1]);
  console.log(arguments[2]);
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

function loadAlternative(state, alternatives, fieldName, alternativeIndex, lang, pasteNames) {

  if (arguments.length === 5) {

    pasteNames = lang;
    lang = false;
  }

  var updated = {
    location: {},
    activeAlternatives: {}
  };

  // update active suggestion index

  updated.activeAlternatives[fieldName] = {
    $set: alternativeIndex

    // update loaded values

  };if (!pasteNames) {

    pasteNames = [fieldName];
  }

  pasteNames.forEach(function (name) {

    if (lang) {

      updated.location[name] = {};

      updated.location[name][lang] = {
        $set: alternatives[alternativeIndex].location[name][lang]
      };
    } else {

      updated.location[name] = {
        $set: alternatives[alternativeIndex].location[name]
      };
    }
  });

  return (0, _immutabilityHelper2.default)(state, updated);
}
//# sourceMappingURL=formActions.js.map