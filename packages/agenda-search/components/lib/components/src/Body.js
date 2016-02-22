"use strict";

var React = require('react'),
    AgendaItem = require('./AgendaItem.js'),
    SearchField = require('react-form-components/build/SearchField.js'),
    List = require('./List'),
    get = require('./get'),
    actions = require('./actions'),
    updateHref = require('./updateHref');

module.exports = React.createClass({
  displayName: 'exports',

  propTypes: {
    res: React.PropTypes.string,
    agendas: React.PropTypes.array,
    page: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {

    return {
      res: '/',
      agendas: [],
      page: 1
    };
  },
  getInitialState: function getInitialState() {

    return {
      total: this.props.total,
      agendas: this.props.agendas,
      pageRange: [this.props.page, this.props.page],
      query: this.props.query };
  },
  // only true at init
  getPage: function getPage(next) {
    var _this = this;

    if (this.state.loading) return;

    var query = {
      oas: this.state.query,
      page: this.state.pageRange[next ? 1 : 0] + (next ? +1 : -1)
    };

    this.setState({ loading: true });

    if (this.state.agendas.length >= this.state.total) return;

    get(this.props.res, query, function (err, data) {

      if (err) {

        _this.setState({ loading: false });

        return console.log('error', err);
      }

      var change = actions.addPageItems(_this.state, next, data);

      change.loading = false;

      _this.setState(change);

      updateHref(query);
    });
  },
  onSearchChange: function onSearchChange(name, search) {

    this.resetPage({
      search: search
    });
  },
  resetPage: function resetPage(newQuery) {
    var _this2 = this;

    get(this.props.res, {
      oas: newQuery,
      page: 1
    }, function (err, data) {

      if (err) return console.log('error', err);

      _this2.setState(actions.resetPageItems(_this2.state, newQuery, data));
    });
  },
  render: function render() {

    console.log('come one');

    return React.createElement(
      'div',
      { className: 'container' },
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-sm-8 col-sm-offset-2 wsq header' },
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'label',
              { className: 'sr-only', 'for': 'agenda_search' },
              'Agenda search'
            ),
            React.createElement(SearchField, {
              name: 'oas[search]',
              label: 'Search',
              placeholder: 'Search',
              value: this.state.query ? this.state.query.search : '',
              onChange: this.onSearchChange
            })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-sm-8 col-sm-offset-2 wsq body media-list agenda-search' },
          React.createElement(List, {
            query: this.state.query,
            pageRange: this.state.pageRange,
            getPage: this.getPage,
            total: this.state.total,
            items: this.state.agendas // a 'get' can maybe be given in props differently here from server?
            , renderItem: function renderItem(i) {
              return React.createElement(AgendaItem, { agenda: i, key: i.uid });
            }
          })
        )
      )
    );
  }
});