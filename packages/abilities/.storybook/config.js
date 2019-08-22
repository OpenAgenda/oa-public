import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { checkA11y, configureA11y } from '@storybook/addon-a11y';
import { getRules } from 'axe-core';

function importAll(req) {
  req.keys().forEach(filename => req(filename));
}

function loadStories() {
  importAll(require.context('../stories', true, /\.stories\.js$/));
}

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React);
}

configureA11y({
  rules: getRules(['wcag2a', 'section508', 'best-practice']).map(v => ({
    id: v.ruleId,
    ...v
  })),
  disableOtherRules: true
});

addDecorator(checkA11y);

configure(loadStories, module);
