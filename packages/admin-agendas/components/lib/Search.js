"use strict";

var React = require("react"),
    SearchField = require('react-form-components/build/SearchField'),
    List = require('react-components/build/List'),
    AgendaItem = require('./AgendaItem');

module.exports = React.createClass({

  displayName: 'Search',

  propTypes: {
    query: React.PropTypes.object,
    agendas: React.PropTypes.array,
    total: React.PropTypes.number,
    pageRange: React.PropTypes.arrayOf(React.PropTypes.number),
    onSelectAgenda: React.PropTypes.func,
    onSearchChange: React.PropTypes.func,
    getSearchPage: React.PropTypes.func
  },

  render: function render() {
    var _this = this;

    return React.createElement(
      "div",
      { className: "col-md-3 admin-search", ref: "search" },
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "header" },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { className: "sr-only", htmlFor: "agenda_search" },
              "Agenda search"
            ),
            React.createElement(SearchField, {
              name: "oas[search]",
              label: "Search",
              placeholder: "Search",
              value: this.props.query ? this.props.query.search : '',
              onChange: this.props.onSearchChange
            })
          )
        )
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "body media-list" },
          React.createElement(List, {
            items: this.props.agendas // a 'get' can maybe be given in props differently here from server?
            , total: this.props.total,
            pageRange: this.props.pageRange,
            getPage: this.props.getSearchPage,
            renderItem: function renderItem(i) {
              return React.createElement(AgendaItem, { agenda: i, key: i.uid, onSelect: _this.props.onSelectAgenda });
            },
            renderEmpty: function renderEmpty() {
              return React.createElement(
                "div",
                { className: "empty" },
                React.createElement(
                  "p",
                  null,
                  "Sorry, no agendas match this search"
                )
              );
            }
          })
        )
      )
    );
  }
});