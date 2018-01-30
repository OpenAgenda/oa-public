"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactRedux = require('react-redux');

var _Component = require('../Component');

var _Component2 = _interopRequireDefault(_Component);

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _references = require('@openagenda/labels/event/references');

var _references2 = _interopRequireDefault(_references);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _reactRedux.connect)(

// map state to props
function (state, props) {
  return {

    search: state.search,
    events: state.events,
    loading: state.loading,
    info: state.info,
    getLabel: (0, _labels2.default)(_references2.default, props.lang || 'fr'),
    suggest: !!state.sample,
    loadingSuggestions: state.loadingSuggestions

  };
},

// map dispatch to props
function (dispatch, props) {
  return {

    onShow: function onShow() {
      return dispatch(_actions2.default.searchShow());
    },

    onSearch: function onSearch(name, value) {
      return dispatch(_actions2.default.search(value));
    },

    onSearchFocus: function onSearchFocus(input) {

      return input.length ? function () {} : dispatch(_actions2.default.suggest());
    },

    //onSearchFocus: ( name, value ) => dispatch( actions.suggest( value ) ),

    onEventRemove: function onEventRemove(eventUid) {
      return dispatch(_actions2.default.eventRemove(eventUid));
    },

    onEventAdd: function onEventAdd(event) {
      return dispatch(_actions2.default.eventAdd(event));
    },

    onSuggestionsAdd: function onSuggestionsAdd() {
      return dispatch(_actions2.default.suggestionsAdd());
    }

  };
})(_Component2.default);
module.exports = exports['default'];