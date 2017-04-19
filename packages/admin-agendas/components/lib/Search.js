"use strict";

var _redboxReact2 = require("redbox-react");

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require("react");

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require("react-transform-catch-errors");

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Search: {
    displayName: "Search"
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: "components/src/Search.jsx",
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require("react"),
    SearchField = require('react-form-components/build/SearchField'),
    List = require('react-components/build/List'),
    Spinner = require('react-form-components/build/Spinner'),
    AgendaItem = require('./AgendaItem');

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

module.exports = _wrapComponent("Search")(React.createClass({

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
            React.createElement(
              "div",
              { className: "input-icon-right" },
              React.createElement("input", {
                className: "form-control",
                placeholder: "Search",
                value: this.props.query ? this.props.query.search : '',
                onChange: function onChange(e) {
                  return _this.props.onSearchChange('oas[search]', e.target.value);
                }
              }),
              React.createElement(
                "button",
                { type: "submit", className: "btn" },
                this.props.loading ? React.createElement(Spinner, { spinner: searchSpinner }) : React.createElement("i", { className: "fa fa-search", "aria-hidden": "true" })
              )
            )
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
}));