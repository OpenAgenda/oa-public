"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactRedux = require("react-redux");

var _Component = _interopRequireDefault(require("../Component"));

var _actions = _interopRequireDefault(require("../actions"));

var _references = _interopRequireDefault(require("@openagenda/labels/event/references"));

var _labels = _interopRequireDefault(require("@openagenda/labels"));

var _default = (0, _reactRedux.connect)( // map state to props
function (state, props) {
  return {
    search: state.search,
    events: state.events,
    loading: state.loading,
    info: state.info,
    getLabel: (0, _labels.default)(_references.default, props.lang || 'fr'),
    suggest: !!state.sample,
    loadingSuggestions: state.loadingSuggestions
  };
}, // map dispatch to props
function (dispatch, props) {
  return {
    onShow: function onShow() {
      return dispatch(_actions.default.searchShow());
    },
    onSearch: function onSearch(name, value) {
      return dispatch(_actions.default.search(value));
    },
    onSearchFocus: function onSearchFocus(input) {
      return input.length ? function () {} : dispatch(_actions.default.suggest());
    },
    //onSearchFocus: ( name, value ) => dispatch( actions.suggest( value ) ),
    onEventRemove: function onEventRemove(eventUid) {
      return dispatch(_actions.default.eventRemove(eventUid));
    },
    onEventAdd: function onEventAdd(event) {
      return dispatch(_actions.default.eventAdd(event));
    },
    onSuggestionsAdd: function onSuggestionsAdd() {
      return dispatch(_actions.default.suggestionsAdd());
    }
  };
})(_Component.default);

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map