import createWidgetManager from './widgetManager';
import EmbedWidget from './embedWidget';

window.oa = window.oa || {};

function init() {
  const widgetManager = createWidgetManager(window.oa);

  widgetManager.register('embed', new EmbedWidget());

  window.oa.ready = widgetManager.ready;

  function readyHandler() {
    window.removeEventListener('DOMContentLoaded', readyHandler);

    widgetManager.load();
    widgetManager.executeReadyQueue();

    window.oa.widgets = {
      load: widgetManager.load,
    };
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    readyHandler();
  } else {
    window.addEventListener('DOMContentLoaded', readyHandler);
  }
}

window.oa.widgets?.load?.();

if (!window.oa.init) {
  window.oa.init = true;
  init();
}
