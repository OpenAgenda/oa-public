import React from 'react';
import { Router, StaticRouter } from 'react-router-dom';
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as LoadableSecret } from '@loadable/component';
import RouterTrigger from './lib/RouterTrigger';
import ScrollToTop from './lib/ScrollToTop';

const { Context: LoadableContext } = LoadableSecret;

export default function wrapApp(app, options = {}) {
  const { Content, history, triggerHooks } = app;
  const {
    req,
    staticContext,
    extractor,
    extraProps,
    disableScrollToTop,
  } = options;

  let baseElement = (
    <RouterTrigger trigger={triggerHooks}>
      <Content extraProps={extraProps} />
    </RouterTrigger>
  );

  if (!disableScrollToTop) {
    baseElement = <ScrollToTop>{baseElement}</ScrollToTop>;
  }

  const element = req ? (
    <LoadableContext.Provider value={extractor}>
      <StaticRouter location={req.originalUrl} context={staticContext}>
        {baseElement}
      </StaticRouter>
    </LoadableContext.Provider>
  ) : (
    <Router history={history} key={Math.random()}>
      {baseElement}
    </Router>
  );

  return element;
}
