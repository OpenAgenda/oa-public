import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import React from 'react';
import { createRoot } from 'react-dom/client';
import Body from '@openagenda/admin-agendas/components/src/Body';
export default options => {
  const params = _objectSpread({
    searchRes: '/',
    agendaRes: '/:uid',
    setAgendaRes: '/get',
    membersRes: '/members',
    canvas: '.js_canvas'
  }, options);
  const elem = /*#__PURE__*/React.createElement(Body, {
    searchRes: params.searchRes,
    agendaRes: params.agendaRes,
    setAgendaRes: params.setAgendaRes,
    membersRes: params.membersRes
  });
  if (options.skipRender) {
    return elem;
  }
  const root = createRoot(document.querySelector(params.canvas));
  root.render(elem);
};
//# sourceMappingURL=main.js.map