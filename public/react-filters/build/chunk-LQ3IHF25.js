// src/utils/extractWidgetsFromDom.js
function extractWidgetsFromDom() {
  const widgetElems = document.querySelectorAll("[data-oa-widget]");
  return Array.from(widgetElems, (elem) => {
    const paramsAttr = elem.getAttribute("data-oa-widget-params");
    const dataSet = JSON.parse(paramsAttr);
    dataSet.destSelector = `[data-oa-widget="${elem.getAttribute("data-oa-widget")}"][data-oa-widget-params="${paramsAttr.replace(
      /["\\]/g,
      "\\$&"
    )}"]`;
    dataSet.elem = elem;
    if (dataSet.name === "favorite") {
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
      dataSet.activeTargetElem = dataSet.activeTargetSelector ? elem.querySelector(dataSet.activeTargetSelector) : null;
    }
    return dataSet;
  });
}

export {
  extractWidgetsFromDom
};
//# sourceMappingURL=chunk-LQ3IHF25.js.map