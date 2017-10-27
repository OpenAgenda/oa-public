'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.setTab = setTab;
var SET_TAB = 'home/menu/SET_TAB';

var initialState = {
  tab: null
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case SET_TAB:
      return _extends({}, state, {
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