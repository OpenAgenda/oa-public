"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

require("core-js/modules/es6.regexp.search");

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

require("core-js/modules/web.dom.iterable");

var _jsxFileName = "/home/bertho/oa/packages/agenda-search/components/src/Body.jsx";

var React = require('react'),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    AgendaItem = require('./AgendaItem'),
    SearchField = require('@openagenda/react-form-components/build/SearchField'),
    Spinner = require('@openagenda/react-form-components/build/Spinner'),
    List = require('@openagenda/react-components/build/List'),
    get = require('@openagenda/utils/get'),
    actions = require('./actions'),
    utils = require('@openagenda/utils'),
    getLabel = require('@openagenda/labels')(require('@openagenda/labels/agenda-search')),
    documentLocation = require('@openagenda/dom-utils/documentLocation'),
    monitorField = require('./monitorField'),
    validateQuery = require('../../validators/query');

module.exports = createReactClass({
  displayName: 'Body',
  propTypes: {
    res: PropTypes.string,
    agendas: PropTypes.array,
    page: PropTypes.number,
    lang: PropTypes.string,
    query: PropTypes.object
  },
  getDefaultProps: function getDefaultProps() {
    return {
      res: '/',
      agendas: [],
      page: 1,
      lang: 'fr',
      query: null
    };
  },
  getInitialState: function getInitialState() {
    var _this = this;

    monitorField('.js_agenda_search', function (search) {
      return _this.resetPage({
        search: search
      });
    });
    var query = {};

    try {
      query = validateQuery(this.props.query);
    } catch (e) {
      console.error('query is not valid: %s', this.props.query);
    }

    return {
      total: this.props.total,
      agendas: this.props.agendas,
      pageRange: [this.props.page, this.props.page],
      query: query
    };
  },
  prepareGetQuery: function prepareGetQuery(query, page) {
    return utils.extend({
      page: page
    }, query);
  },
  getPage: function getPage(next) {
    var _this2 = this;

    if (this.state.loading) return;
    var page = this.state.pageRange[next ? 1 : 0] + (next ? +1 : -1);
    if (this.state.agendas.length >= this.state.total) return;
    this.setState({
      loading: true
    });
    get(this.props.res, this.getHrefQuery(utils.extend({
      preventCache: Math.random(),
      page: page
    }, this.state.query)), function (err, data) {
      if (err) {
        _this2.setState({
          loading: false
        });

        return console.log('error', err);
      }

      var change = actions.addPageItems(_this2.state, next, data);
      change.loading = false;

      _this2.setState(change);

      documentLocation.setQueryPart(_this2.getHrefQuery(utils.extend({
        page: page
      }, _this2.state.query)));
    });
  },
  onSearchChange: function onSearchChange(name, search) {
    this.resetPage({
      search: search
    });
  },
  resetPage: function resetPage(newQuery) {
    var _this3 = this;

    this.setState({
      loading: true
    });
    get(this.props.res, this.getHrefQuery(utils.extend({
      page: 1
    }, newQuery)), function (err, data) {
      if (err) return console.log('error', err);

      _this3.setState(actions.resetPageItems(_this3.state, newQuery, data));

      documentLocation.setQueryPart(_this3.getHrefQuery(utils.extend({
        page: 1
      }, newQuery)));
    });
  },
  getHrefQuery: function getHrefQuery(query) {
    var filtered = {};
    (0, _keys.default)(query).forEach(function (k) {
      if (query[k] === null) return;
      if (typeof query[k] === 'string' && !query[k].length) return;
      filtered[k] = query[k];
    });
    return filtered;
  },
  renderHead: function renderHead() {
    return React.createElement("div", {
      className: "header",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 162
      },
      __self: this
    }, React.createElement("h1", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 163
      },
      __self: this
    }, getLabel('latestUpdated', this.props.lang)));
  },
  renderSearchHead: function renderSearchHead() {
    return React.createElement("div", {
      className: "header",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 170
      },
      __self: this
    }, React.createElement("h1", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 171
      },
      __self: this
    }, getLabel('results', {
      search: this.state.query.search
    }, this.props.lang)), React.createElement("span", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 172
      },
      __self: this
    }, getLabel('found', {
      count: this.state.total
    }, this.props.lang)));
  },
  render: function render() {
    var _this4 = this;

    return React.createElement("div", {
      className: "container agenda-search top-margined",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 179
      },
      __self: this
    }, React.createElement("div", {
      className: "row",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 180
      },
      __self: this
    }, React.createElement("div", {
      className: "wsq col-sm-8 col-sm-offset-2",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 181
      },
      __self: this
    }, this.state.loading ? React.createElement(Spinner, {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 182
      },
      __self: this
    }) : null, this.state.query.search ? this.renderSearchHead() : this.renderHead(), React.createElement("div", {
      className: "body media-list",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 184
      },
      __self: this
    }, this.state.agendas.length ? React.createElement(List, {
      query: this.state.query,
      pageRange: this.state.pageRange,
      getPage: this.getPage,
      total: this.state.total,
      prevLabel: getLabel('loadPrevious', this.props.lang),
      nextLabel: getLabel('loadNext', this.props.lang),
      items: this.state.agendas // a 'get' can maybe be given in props differently here from server?
      ,
      renderItem: function renderItem(i) {
        return React.createElement(AgendaItem, {
          agenda: i,
          key: i.uid,
          lang: _this4.props.lang,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 193
          },
          __self: this
        });
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 185
      },
      __self: this
    }) : React.createElement("div", {
      className: "empty",
      __source: {
        fileName: _jsxFileName,
        lineNumber: 194
      },
      __self: this
    }, React.createElement("p", {
      __source: {
        fileName: _jsxFileName,
        lineNumber: 194
      },
      __self: this
    }, getLabel('empty', this.props.lang)))))));
  }
});
//# sourceMappingURL=Body.js.map