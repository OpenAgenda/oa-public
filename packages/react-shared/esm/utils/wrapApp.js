var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/utils/wrapApp.js";
import React from 'react';
import { Router, StaticRouter } from 'react-router-dom';
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as LoadableSecret } from '@loadable/component';
import RouterTrigger from './lib/RouterTrigger';
import ScrollToTop from './lib/ScrollToTop';
import { jsx as ___EmotionJSX } from "@emotion/core";
var LoadableContext = LoadableSecret.Context;
export default function wrapApp(app) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var Content = app.Content,
      history = app.history,
      triggerHooks = app.triggerHooks;
  var req = options.req,
      staticContext = options.staticContext,
      extractor = options.extractor,
      extraProps = options.extraProps,
      disableScrollToTop = options.disableScrollToTop;

  var baseElement = ___EmotionJSX(RouterTrigger, {
    trigger: triggerHooks,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 5
    }
  }, ___EmotionJSX(Content, {
    extraProps: extraProps,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }));

  if (!disableScrollToTop) {
    baseElement = ___EmotionJSX(ScrollToTop, {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 26,
        columnNumber: 19
      }
    }, baseElement);
  }

  var element = req ? ___EmotionJSX(LoadableContext.Provider, {
    value: extractor,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 5
    }
  }, ___EmotionJSX(StaticRouter, {
    location: req.originalUrl,
    context: staticContext,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 7
    }
  }, baseElement)) : ___EmotionJSX(Router, {
    history: history,
    key: Math.random(),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 36,
      columnNumber: 5
    }
  }, baseElement);
  return element;
}
//# sourceMappingURL=wrapApp.js.map