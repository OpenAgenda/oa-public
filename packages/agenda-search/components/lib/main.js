"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));

var React = require('react'),
    ReactDom = require('react-dom'),
    du = require('@openagenda/dom-utils'),
    dl = require('@openagenda/dom-utils/documentLocation'),
    utils = require('@openagenda/utils'),
    Body = require('./Body');

module.exports = function (options) {
  var params = utils.extend({
    res: '/',
    // where to fetch list.
    canvas: '.js_search_canvas',
    dataTag: 'data-options',
    lang: 'en'
  }, options);
  var data = du.parseJsonAttribute('body', params.dataTag, {
    agendas: [],
    total: 0
  });
  ReactDom.hydrate(React.createElement(Body, {
    res: params.res,
    lang: params.lang,
    query: dl.getQuery(),
    page: (0, _parseInt2.default)(dl.getQueryPart('page', 1), 10),
    agendas: data.agendas,
    total: data.total
  }), du.el(params.canvas));
};
//# sourceMappingURL=main.js.map