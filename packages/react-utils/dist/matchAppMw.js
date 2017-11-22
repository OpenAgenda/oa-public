'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = matchAppMw;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createMemoryHistory = require('react-router/lib/createMemoryHistory');

var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _reactRouter = require('react-router');

var _reduxConnect = require('redux-connect');

var _verror = require('verror');

var _verror2 = _interopRequireDefault(_verror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function matchAppMw(createStore, getRoutes, ApiClient) {

  return function (params, path, cb) {
    return function (req, res, next) {

      var url = req.originalUrl /*.replace( path, '' )*/;
      var client = new ApiClient(params.state.settings.apiRoot, req);
      var memoryHistory = (0, _createMemoryHistory2.default)(url);
      var store = createStore(memoryHistory, client, params.state);
      var history = (0, _reactRouterRedux.syncHistoryWithStore)(memoryHistory, store);

      (0, _reactRouter.match)({
        history: history,
        routes: getRoutes(store),
        location: url
      }, function (error, redirectLocation, renderProps) {
        if (redirectLocation) {
          res.redirect(redirectLocation.pathname + redirectLocation.search);
        } else if (error) {
          console.error('ROUTER ERROR:', error);
          next(error);
        } else if (renderProps) {
          var redirect = function redirect(to) {
            throw new _verror2.default({ name: 'RedirectError', info: { to: to } });
          };

          (0, _reduxConnect.loadOnServer)(Object.assign({}, renderProps, { store: store, helpers: { client: client, redirect: redirect } })).then(function () {

            var component = (0, _react.createElement)(_reactRedux.Provider, { store: store, key: 'provider' }, (0, _react.createElement)(_reduxConnect.ReduxAsyncConnect, renderProps));

            cb(req, res, next, { store: store, component: component });
          }).catch(function (mountError) {
            if (mountError.name === 'RedirectError') {
              return res.redirect(_verror2.default.info(mountError).to);
            }

            console.error('MOUNT ERROR:', mountError);
            next(mountError);
          });
        } else {
          next(); // Not found here
        }
      });
    };
  };
};
module.exports = exports['default'];
//# sourceMappingURL=matchAppMw.js.map