import extractAttrs from './extractAttrs';
import parseFilterAttrs from './parseFilterAttrs';

export default function getWidgets() {
  const widgetElems = document.querySelectorAll('[data-oa-widget]');

  return Array.from(widgetElems, elem => {
    const dataSet = parseFilterAttrs(extractAttrs(elem, 'data-oa-widget-'));
    dataSet.destSelector = `[data-oa-widget="${elem.getAttribute('data-oa-widget')}"]`;

    if (dataSet.name === 'favorite') {
      dataSet.elem = elem;
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
      dataSet.activeTargetElem = dataSet.activeTargetSelector ? elem.querySelector(dataSet.activeTargetSelector) : null;
    }

    return dataSet;
  });
}
