"use strict";

var React = require("react"),
    Search = require('./Search'),
    Details = require('./Details'),
    actions = require('./actions'),
    get = require('utils/get'),
    post = require('utils/post'),
    _updateHref = require('dom-utils/documentLocation').setQueryPart,
    getQuery = require('dom-utils/documentLocation').getQuery;

module.exports = React.createClass({

  displayName: 'Body',

  propTypes: {
    searchRes: React.PropTypes.string,
    agendaRes: React.PropTypes.string,
    setAgendaRes: React.PropTypes.string,
    stakeholdersRes: React.PropTypes.string,

    agenda: React.PropTypes.object
  },

  getInitialState: function getInitialState() {

    return {
      loading: true,
      search: {
        query: {},
        agendas: [],
        total: 0,
        pageRange: [1, 1]
      },
      agenda: {},
      stakeholders: [],
      stakeholdersPageRange: [1, 1],
      stakeholdersTotal: 0
    };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    this.setState(actions.loading(this.state, false));

    var q = Object.assign({}, {
      oas: {
        search: ''
      },
      searchPage: 1,
      agendaId: null,
      stakeholdersPage: 1
    }, getQuery());

    if (!this.state.search.agendas.length) this.resetSearchPage(q.oas, q.searchPage, function () {
      if (q.agendaId) _this.onSelectAgenda(q.agendaId, q.stakeholdersPage);
    });
  },
  onSearchChange: function onSearchChange(name, search) {

    this.resetSearchPage({
      search: search
    });
  },
  resetSearchPage: function resetSearchPage(newQuery) {
    var _this2 = this;

    var page = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var cb = arguments[2];


    var query = {
      oas: newQuery,
      searchPage: page
    };

    get(this.props.searchRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this2.setState(actions.resetPageItems(_this2.state, newQuery, data, page));

      updateHref(Object.assign(getQuery() || {}, query));

      if (cb) cb();
    });
  },
  getSearchPage: function getSearchPage(next) {
    var _this3 = this;

    if (this.state.loading) return;

    var query = {
      oas: this.state.search.query,
      searchPage: this.state.search.pageRange[next ? 1 : 0] + (next ? +1 : -1)
    };

    if (this.state.search.agendas.length >= this.state.search.total) return;

    this.setState(actions.loading(this.state, true));

    get(this.props.searchRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this3.setState(actions.loading(_this3.state, false));

      _this3.setState(actions.addPageItems(_this3.state, next, data));

      updateHref(Object.assign(getQuery() || {}, query));
    });
  },
  onSelectAgenda: function onSelectAgenda(id) {
    var _this4 = this;

    var page = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];


    var query = {
      agendaId: id,
      stakeholdersPage: page
    };

    get(this.props.stakeholdersRes, query, function (err, stakeholders) {

      if (err) return console.log('error', err);

      get(_this4.props.agendaRes, { id: id }, function (err, agenda) {

        if (err) return console.log('error', err);

        _this4.setState(actions.selectAgenda(_this4.state, agenda, stakeholders, page));

        updateHref(Object.assign(getQuery() || {}, query));
      });
    });
  },
  getStakeholdersPage: function getStakeholdersPage(next) {
    var _this5 = this;

    if (this.state.loading) return;

    var query = {
      agendaId: this.state.agenda.id,
      stakeholdersPage: this.state.stakeholdersPageRange[next ? 1 : 0] + (next ? +1 : -1)
    };

    if (this.state.stakeholders.length >= this.state.stakeholdersTotal) return;

    this.setState(actions.loading(this.state, true));

    get(this.props.stakeholdersRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this5.setState(actions.loading(_this5.state, false));

      _this5.setState(actions.addStakeholdersItems(_this5.state, next, data));

      updateHref(Object.assign(getQuery() || {}, query));
    });
  },
  setAgenda: function setAgenda(data) {
    var _this6 = this;

    return new Promise(function (resolve, reject) {

      post(_this6.props.setAgendaRes + "/" + _this6.state.agenda.uid, data, function (err, result) {

        if (err) return reject(err);

        _this6.setState({ agenda: result.agenda });

        resolve(result);
      });
    });
  },
  render: function render() {

    return React.createElement(
      "div",
      { className: "admin" },
      React.createElement(
        "div",
        { className: "container-fluid" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(Search, {
            query: this.state.search.query,
            agendas: this.state.search.agendas,
            total: this.state.search.total,
            pageRange: this.state.search.pageRange,
            getSearchPage: this.getSearchPage,
            onSelectAgenda: this.onSelectAgenda,
            onSearchChange: this.onSearchChange
          }),
          " ",
          React.createElement(Details, {
            agenda: this.state.agenda,
            stakeholders: this.state.stakeholders,
            total: this.state.stakeholdersTotal,
            pageRange: this.state.stakeholdersPageRange,
            getStakeholdersPage: this.getStakeholdersPage,
            setAgenda: this.setAgenda
          })
        )
      )
    );
  }
});

function updateHref(query) {

  var q = Object.assign({}, {
    oas: {
      search: ''
    },
    searchPage: 1,
    stakeholdersPage: 1
  }, query);

  if (q.searchPage <= 1) delete q.searchPage;
  if (q.oas.search == '') delete q.oas.search;
  if (q.stakeholdersPage <= 1) delete q.stakeholdersPage;

  _updateHref(q);
}