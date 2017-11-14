"use strict";

var React = require('react'),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    SearchField = require('@openagenda/react-form-components/build/SearchField'),
    List = require('@openagenda/react-components/build/List'),
    Spinner = require('@openagenda/react-form-components/build/Spinner'),
    AgendaItem = require('./AgendaItem');

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

module.exports = createReactClass({

  displayName: 'Search',

  propTypes: {
    query: PropTypes.object,
    agendas: PropTypes.array,
    total: PropTypes.number,
    pageRange: PropTypes.arrayOf(PropTypes.number),
    onSelectAgenda: PropTypes.func,
    onSearchChange: PropTypes.func,
    getSearchPage: PropTypes.func
  },

  render: function render() {
    var _this = this;

    return React.createElement(
      'div',
      { className: 'col-md-3 admin-search', ref: 'search' },
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'header' },
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement(
              'label',
              { className: 'sr-only', htmlFor: 'agenda_search' },
              'Agenda search'
            ),
            React.createElement(
              'div',
              { className: 'input-icon-right' },
              React.createElement('input', {
                className: 'form-control',
                placeholder: 'Search',
                value: this.props.query ? this.props.query.search : '',
                onChange: function onChange(e) {
                  return _this.props.onSearchChange('oas[search]', e.target.value);
                }
              }),
              React.createElement(
                'button',
                { type: 'submit', className: 'btn' },
                this.props.loading ? React.createElement(Spinner, { spinner: searchSpinner }) : React.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true' })
              )
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'body media-list' },
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
                'div',
                { className: 'empty' },
                React.createElement(
                  'p',
                  null,
                  'Sorry, no agendas match this search'
                )
              );
            }
          })
        )
      )
    );
  }
});
//# sourceMappingURL=Search.js.map