"use strict";

var React = require('react'),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    AgendaItem = require('./AgendaItem'),
    SearchField = require('react-form-components/build/SearchField'),
    Spinner = require('react-form-components/build/Spinner'),
    List = require('react-components/build/List'),
    get = require('utils/get'),
    actions = require('./actions'),
    utils = require('utils'),
    getLabel = require('labels')(require('labels/agenda-search')),
    documentLocation = require('dom-utils/documentLocation'),
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
      return _this.resetPage({ search: search });
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

    this.setState({ loading: true });

    get(this.props.res, this.getHrefQuery(utils.extend({ preventCache: Math.random(), page: page }, this.state.query)), function (err, data) {

      if (err) {

        _this2.setState({ loading: false });

        return console.log('error', err);
      }

      var change = actions.addPageItems(_this2.state, next, data);

      change.loading = false;

      _this2.setState(change);

      documentLocation.setQueryPart(_this2.getHrefQuery(utils.extend({ page: page }, _this2.state.query)));
    });
  },
  onSearchChange: function onSearchChange(name, search) {

    this.resetPage({ search: search });
  },
  resetPage: function resetPage(newQuery) {
    var _this3 = this;

    this.setState({ loading: true });

    get(this.props.res, this.getHrefQuery(utils.extend({ page: 1 }, newQuery)), function (err, data) {

      if (err) return console.log('error', err);

      _this3.setState(actions.resetPageItems(_this3.state, newQuery, data));

      documentLocation.setQueryPart(_this3.getHrefQuery(utils.extend({ page: 1 }, newQuery)));
    });
  },
  getHrefQuery: function getHrefQuery(query) {

    var filtered = {};

    Object.keys(query).forEach(function (k) {

      if (query[k] === null) return;

      if (typeof query[k] === 'string' && !query[k].length) return;

      filtered[k] = query[k];
    });

    return filtered;
  },
  renderHead: function renderHead() {

    return React.createElement(
      'div',
      { className: 'header' },
      React.createElement(
        'h1',
        null,
        getLabel('latestUpdated', this.props.lang)
      )
    );
  },
  renderSearchHead: function renderSearchHead() {

    return React.createElement(
      'div',
      { className: 'header' },
      React.createElement(
        'h1',
        null,
        getLabel('results', { search: this.state.query.search }, this.props.lang)
      ),
      React.createElement(
        'span',
        null,
        getLabel('found', { count: this.state.total }, this.props.lang)
      )
    );
  },
  render: function render() {
    var _this4 = this;

    return React.createElement(
      'div',
      { className: 'container agenda-search top-margined' },
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'wsq col-sm-8 col-sm-offset-2' },
          this.state.loading ? React.createElement(Spinner, null) : null,
          this.state.query.search ? this.renderSearchHead() : this.renderHead(),
          React.createElement(
            'div',
            { className: 'body media-list' },
            this.state.agendas.length ? React.createElement(List, {
              query: this.state.query,
              pageRange: this.state.pageRange,
              getPage: this.getPage,
              total: this.state.total,
              prevLabel: getLabel('loadPrevious', this.props.lang),
              nextLabel: getLabel('loadNext', this.props.lang),
              items: this.state.agendas // a 'get' can maybe be given in props differently here from server?
              , renderItem: function renderItem(i) {
                return React.createElement(AgendaItem, { agenda: i, key: i.uid, lang: _this4.props.lang });
              }
            }) : React.createElement(
              'div',
              { className: 'empty' },
              React.createElement(
                'p',
                null,
                getLabel('empty', this.props.lang)
              )
            )
          )
        )
      )
    );
  }
});