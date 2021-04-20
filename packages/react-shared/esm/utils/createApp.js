import "core-js/modules/es.function.name";
import _Object$assign from "@babel/runtime-corejs3/core-js/object/assign";
import _Array$isArray from "@babel/runtime-corejs3/core-js/array/is-array";
import _concatInstanceProperty from "@babel/runtime-corejs3/core-js/instance/concat";
import _toConsumableArray from "@babel/runtime-corejs3/helpers/toConsumableArray";
var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/createApp.js";
import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { ApiClientContext } from '../contexts';
import apiClient from './apiClient';
import createStore from './lib/createStore';
import clientMiddleware from './lib/clientMiddleware';
import makeTriggerHooks from './lib/makeTriggerHooks';
import { jsx as ___EmotionJSX } from "@emotion/core";

function getDefaultHistory(req) {
  return req ? createMemoryHistory({
    initialEntries: [req.originalUrl]
  }) : createBrowserHistory();
}

export default function createApp(options) {
  var _context,
      _context2,
      _this = this;

  var name = options.name,
      initialState = options.initialState,
      layout = options.layout,
      req = options.req,
      apiRoot = options.apiRoot,
      prefix = options.prefix,
      getReducers = options.getReducers,
      getRoutes = options.getRoutes,
      legacyApiClient = options.legacyApiClient,
      _options$reduxMiddlew = options.reduxMiddleware,
      reduxMiddleware = _options$reduxMiddlew === void 0 ? [] : _options$reduxMiddlew;
  var client = apiClient(apiRoot, req, {
    legacy: legacyApiClient
  });
  var history = options.history || getDefaultHistory(req);
  var helpers = {};
  var store = createStore(getReducers, initialState, compose(applyMiddleware.apply(void 0, _concatInstanceProperty(_context = [clientMiddleware(helpers)]).call(_context, _toConsumableArray(_Array$isArray(reduxMiddleware) ? reduxMiddleware : [reduxMiddleware]))), typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__({
    name: name ? _concatInstanceProperty(_context2 = "".concat(name, " \u2014 ")).call(_context2, document.title) : document.title
  }) : function (v) {
    return v;
  }));
  var routes = getRoutes(prefix);

  _Object$assign(helpers, {
    client: client,
    store: store,
    history: history,
    location: history.location
  });

  var triggerHooks = makeTriggerHooks({
    routes: routes,
    history: history,
    helpers: helpers,
    req: req
  });
  var Content = /*#__PURE__*/React.memo(function (_ref) {
    var extraProps = _ref.extraProps,
        switchProps = _ref.switchProps;
    return ___EmotionJSX(Provider, {
      store: store,
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 73,
        columnNumber: 5
      }
    }, ___EmotionJSX(ApiClientContext.Provider, {
      value: client,
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 74,
        columnNumber: 7
      }
    }, renderRoutes(routes, extraProps, switchProps)));
  });
  return {
    Content: Content,
    client: client,
    store: store,
    history: history,
    routes: routes,
    triggerHooks: triggerHooks,
    layout: layout
  };
}
//# sourceMappingURL=createApp.js.map