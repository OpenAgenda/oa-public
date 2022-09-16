import render from './render';

// hoop jumping to load render once only
(() => {
  if (window.storiesMainWasLoaded) {
    return;
  }

  window.storiesMainWasLoaded = true;

  if (document?.readyState === 'complete') {
    render(window.oa);
    return;
  }

  window.addEventListener('load', () => {
    render(window.oa);
  });
})();
