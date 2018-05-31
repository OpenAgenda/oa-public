"use strict";

var React = require('react'),
    ReactDom = require('react-dom'),
    du = require('@openagenda/dom-utils'),
    dl = require('@openagenda/dom-utils/documentLocation'),
    utils = require('@openagenda/utils'),
    Body = require('./Body');

module.exports = function (options) {

  var params = utils.extend({
    searchRes: '/',
    agendaRes: '/get',
    setAgendaRes: '/get',
    stakeholdersRes: '/stakeholders',
    canvas: '.js_canvas'
  }, options);

  ReactDom.render(React.createElement(Body, {
    searchRes: params.searchRes,
    agendaRes: params.agendaRes,
    setAgendaRes: params.setAgendaRes,
    stakeholdersRes: params.stakeholdersRes
  }), du.el(params.canvas));
};
//# sourceMappingURL=main.js.map