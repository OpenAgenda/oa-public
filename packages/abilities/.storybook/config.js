import { configure } from '@storybook/react';

function importAll(req) {
  req.keys().forEach(filename => req(filename));
}

function loadStories() {
  importAll(require.context('../stories', true, /\.stories\.js$/));
}

configure(loadStories, module);
