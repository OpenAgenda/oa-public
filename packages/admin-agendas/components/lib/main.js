"use strict";

var React = require('react'),
    ReactDom = require('react-dom'),
    du = require('dom-utils'),
    dl = require('dom-utils/documentLocation'),
    utils = require('utils'),
    Body = require('./Body');

module.exports = function (options) {

  var params = utils.extend({
    searchRes: '/',
    stakeholdersRes: '/stakeholders/',
    canvas: '.js_canvas',
    dataTag: 'data-options'
  }, options);

  var data = du.parseJsonAttribute('body', params.dataTag, {
    agendas: [],
    agendasTotal: 0,
    stakeholders: [],
    stakeholdersTotal: 0
  });

  ReactDom.render(React.createElement(Body, {
    //search
    searchRes: params.searchRes,
    searchQuery: dl.getQueryPart('oas', {}),
    searchPage: parseInt(dl.getQueryPart('searchPage', 1), 10),
    agendas: data.agendas,
    agendasTotal: data.total,
    //stakeholders
    stakeholdersRes: params.stakeholdersRes,
    stakeholdersPage: parseInt(dl.getQueryPart('stakeholdersPage', 1), 10),
    stakeholders: data.stakeholders,
    stakeholdersTotal: data.stakeholdersTotal
  }), du.el(params.canvas));
};