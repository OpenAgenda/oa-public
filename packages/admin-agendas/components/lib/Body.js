"use strict";

var React = require("react"),
    Search = require('./Search'),
    Details = require('./Details'),
    actions = require('./actions'),
    get = require('utils/get'),
    updateHref = require('dom-utils/documentLocation').setQueryPart,
    getQuery = require('dom-utils/documentLocation').getQuery;

module.exports = React.createClass({

  displayName: 'Body',

  propTypes: {
    searchRes: React.PropTypes.string,
    searchQuery: React.PropTypes.object,
    searchPage: React.PropTypes.number,
    agendas: React.PropTypes.array,
    agendasTotal: React.PropTypes.number,

    stakeholdersRes: React.PropTypes.string,
    stakeholdersQuery: React.PropTypes.object,
    stakeholdersPage: React.PropTypes.number,
    stakeholders: React.PropTypes.array,
    stakeholdersTotal: React.PropTypes.number,

    agenda: React.PropTypes.object
  },

  getInitialState: function getInitialState() {

    return {
      loading: true,
      search: {
        query: this.props.searchQuery,
        agendas: this.props.agendas,
        total: this.props.agendasTotal,
        pageRange: [this.props.searchPage, this.props.searchPage]
      },
      agenda: this.props.agenda,
      stakeholders: this.props.stakeholders,
      stakeholdersPageRange: [this.props.stakeholdersPage, this.props.stakeholdersPage],
      stakeholdersTotal: this.props.stakeholdersTotal
    };
  },
  componentDidMount: function componentDidMount() {

    if (this.state.search.agendas.length) this.setState(actions.loading(this.state, false));
    this.resetSearchPage({});
  },
  onSearchChange: function onSearchChange(name, search) {

    this.resetSearchPage({
      search: search
    });
  },
  resetSearchPage: function resetSearchPage(newQuery) {
    var _this = this;

    var query = {
      oas: newQuery,
      searchPage: 1
    };

    get(this.props.searchRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this.setState(actions.resetPageItems(_this.state, newQuery, data));

      updateHref(Object.assign(getQuery() || {}, query));
    });
  },
  getSearchPage: function getSearchPage(next) {
    var _this2 = this;

    if (this.state.loading) return;

    var query = {
      oas: this.state.search.query,
      searchPage: this.state.search.pageRange[next ? 1 : 0] + (next ? +1 : -1)
    };

    if (this.state.search.agendas.length >= this.state.search.total) return;

    this.setState(actions.loading(this.state, true));

    get(this.props.searchRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this2.setState(actions.loading(_this2.state, false));

      _this2.setState(actions.addPageItems(_this2.state, next, data));

      updateHref(Object.assign(getQuery() || {}, query));
    });
  },
  onSelectAgenda: function onSelectAgenda(id) {
    var _this3 = this;

    var agenda = this.state.search.agendas.filter(function (v) {
      return v.id == id;
    })[0];

    var query = {
      agendaId: id
    };

    get(this.props.stakeholdersRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this3.setState(actions.selectAgenda(_this3.state, agenda, data));

      updateHref(Object.assign(getQuery() || {}, query));
    });
  },
  getStakeholdersPage: function getStakeholdersPage(next) {
    var _this4 = this;

    if (this.state.loading) return;

    var query = {
      agendaId: this.state.agenda.id,
      stakeholdersPage: this.state.stakeholdersPageRange[next ? 1 : 0] + (next ? +1 : -1)
    };

    if (this.state.stakeholders.length >= this.state.stakeholdersTotal) return;

    this.setState(actions.loading(this.state, true));

    get(this.props.stakeholdersRes, query, function (err, data) {

      if (err) return console.log('error', err);

      _this4.setState(actions.loading(_this4.state, false));

      _this4.setState(actions.addStakeholdersItems(_this4.state, next, data));

      updateHref(Object.assign(getQuery() || {}, query));
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
          React.createElement(Details, {
            agenda: this.state.agenda,
            stakeholders: this.state.stakeholders,
            total: this.state.stakeholdersTotal,
            pageRange: this.state.stakeholdersPageRange,
            getStakeholdersPage: this.getStakeholdersPage
          })
        )
      )
    );
  }
});