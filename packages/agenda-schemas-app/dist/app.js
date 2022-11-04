"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));

var _reactShared = require("@openagenda/react-shared");

var _getRoutes = _interopRequireDefault(require("./getRoutes"));

var _default = function _default(options) {
  var initialState = options.initialState;
  var _initialState$setting = initialState.settings,
      apiRoot = _initialState$setting.apiRoot,
      prefix = _initialState$setting.prefix;

  var getApp = _reactShared.createApp.bind(null, (0, _objectSpread2.default)((0, _objectSpread2.default)({}, options), {}, {
    name: 'agendaSchemaApp',
    // simplifie le debug. Ce n'est pas un composant -> minuscule
    initialState: initialState,
    apiRoot: apiRoot,
    prefix: prefix,
    getRoutes: _getRoutes.default
  }));

  var app = getApp();
  return app;
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=app.js.map