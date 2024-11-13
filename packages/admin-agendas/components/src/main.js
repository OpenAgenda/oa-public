import React from 'react';
import ReactDOM from 'react-dom';
import Body from './Body';

export default options => {
  const params = {
    searchRes: '/',
    agendaRes: '/get',
    setAgendaRes: '/get',
    membersRes: '/members',
    canvas: '.js_canvas',
    ...options
  };

  const elem = React.createElement(Body, {
    searchRes: params.searchRes,
    agendaRes: params.agendaRes,
    setAgendaRes: params.setAgendaRes,
    membersRes: params.membersRes,
  });

  if (options.skipRender) {
    return elem;
  }

  ReactDOM.render(elem, document.querySelector(params.canvas));
};
