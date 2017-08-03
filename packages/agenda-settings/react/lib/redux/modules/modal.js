'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;
exports.setModal = setModal;
var SET_MODAL = 'agenda-settings/modal/SET_MODAL';

var initialState = {
  visible: false
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];


  switch (action.type) {
    case SET_MODAL:
      return _extends({}, state, action.options);
    default:
      return state;
  }
}

function setModal(options) {
  return {
    type: SET_MODAL,
    options: options
  };
}
//# sourceMappingURL=modal.js.map