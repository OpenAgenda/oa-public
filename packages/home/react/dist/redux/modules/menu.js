'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = reducer;
exports.setTab = setTab;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SET_TAB = 'home/menu/SET_TAB';

var initialState = {
  tab: null
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case SET_TAB:
      return (0, _extends3.default)({}, state, {
        tab: action.tab
      });
    default:
      return state;
  }
}

function setTab(tab) {
  return {
    type: SET_TAB,
    tab: tab
  };
}
//# sourceMappingURL=menu.js.map