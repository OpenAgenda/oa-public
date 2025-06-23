// src/utils/extractFiltersFromDom.js
import React from "react";
function extractFiltersFromDom() {
  const filterElems = document.querySelectorAll("[data-oa-filter]");
  return Array.from(filterElems, (elem) => {
    const paramsAttr = elem.getAttribute("data-oa-filter-params");
    const dataSet = JSON.parse(paramsAttr);
    dataSet.destSelector = `[data-oa-filter="${elem.getAttribute("data-oa-filter")}"][data-oa-filter-params="${paramsAttr.replace(
      /["\\]/g,
      "\\$&"
    )}"]`;
    dataSet.elem = elem;
    if (dataSet.type === "custom" || dataSet.type === "favorites") {
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
    } else {
      dataSet.elemRef = React.createRef();
    }
    return dataSet;
  });
}

export {
  extractFiltersFromDom
};
//# sourceMappingURL=chunk-2RSB3QXO.js.map