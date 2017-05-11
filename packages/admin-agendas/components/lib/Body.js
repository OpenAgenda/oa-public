"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Body: {
    displayName: 'Body'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'components/src/Body.jsx',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react'),
    PropTypes = require('prop-types'),
    Search = require('./Search'),
    Details = require('./Details'),
    actions = require('./actions'),
    get = require('utils/get'),
    post = require('utils/post'),
    debounce = require('lodash/debounce'),
    _updateHref = require('dom-utils/documentLocation').setQueryPart,
    getQuery = require('dom-utils/documentLocation').getQuery;

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

module.exports = _wrapComponent('Body')((_temp = _class = function (_React$Component) {
  _inherits(Body, _React$Component);

  function Body(props) {
    _classCallCheck(this, Body);

    var _this = _possibleConstructorReturn(this, (Body.__proto__ || Object.getPrototypeOf(Body)).call(this, props));

    _this.state = {
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
    _this.debouncedSearch = debounce(_this.search, 500);


    _this.debouncedSearch = _this.debouncedSearch.bind(_this);
    _this.search = _this.search.bind(_this);
    _this.resetSearchPage = _this.resetSearchPage.bind(_this);
    _this.onSearchChange = _this.onSearchChange.bind(_this);
    _this.getSearchPage = _this.getSearchPage.bind(_this);
    _this.onSelectAgenda = _this.onSelectAgenda.bind(_this);
    _this.getStakeholdersPage = _this.getStakeholdersPage.bind(_this);
    _this.setAgenda = _this.setAgenda.bind(_this);
    return _this;
  }

  _createClass(Body, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

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
        if (q.agendaId) _this2.onSelectAgenda(q.agendaId, q.stakeholdersPage);
      });
    }
  }, {
    key: 'onSearchChange',
    value: function onSearchChange(name, search) {

      this.resetSearchPage({
        search: search
      });
    }
  }, {
    key: 'resetSearchPage',
    value: function resetSearchPage(newQuery) {
      var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var cb = arguments[2];


      var query = {
        oas: newQuery,
        searchPage: page
      };

      this.setState(actions.setSearch(this.state, newQuery));

      this.debouncedSearch(query, page, cb);
    }
  }, {
    key: 'search',
    value: function search(query, page, cb) {
      var _this3 = this;

      this.setState(actions.loading(this.state, true));

      get(this.props.searchRes, query, function (err, data) {

        _this3.setState(actions.loading(_this3.state, false));

        if (err) return console.log('error', err);

        _this3.setState(actions.resetPageItems(_this3.state, data, page));

        updateHref(Object.assign(getQuery() || {}, query));

        if (cb) cb();
      });
    }
  }, {
    key: 'getSearchPage',
    value: function getSearchPage(next) {
      var _this4 = this;

      if (this.state.loading) return;

      var query = {
        oas: this.state.search.query,
        searchPage: this.state.search.pageRange[next ? 1 : 0] + (next ? +1 : -1)
      };

      if (this.state.search.agendas.length >= this.state.search.total) return;

      this.setState(actions.loading(this.state, true));

      get(this.props.searchRes, query, function (err, data) {

        if (err) return console.log('error', err);

        _this4.setState(actions.loading(_this4.state, false));

        _this4.setState(actions.addPageItems(_this4.state, next, data));

        updateHref(Object.assign(getQuery() || {}, query));
      });
    }
  }, {
    key: 'onSelectAgenda',
    value: function onSelectAgenda(id) {
      var _this5 = this;

      var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;


      var query = {
        agendaId: id,
        stakeholdersPage: page
      };

      get(this.props.stakeholdersRes, query, function (err, stakeholders) {

        if (err) return console.log('error', err);

        get(_this5.props.agendaRes, { id: id }, function (err, agenda) {

          if (err) return console.log('error', err);

          _this5.setState(actions.selectAgenda(_this5.state, agenda, stakeholders, page));

          updateHref(Object.assign(getQuery() || {}, query));
        });
      });
    }
  }, {
    key: 'getStakeholdersPage',
    value: function getStakeholdersPage(next) {
      var _this6 = this;

      if (this.state.loading) return;

      var query = {
        agendaId: this.state.agenda.id,
        stakeholdersPage: this.state.stakeholdersPageRange[next ? 1 : 0] + (next ? +1 : -1)
      };

      if (this.state.stakeholders.length >= this.state.stakeholdersTotal) return;

      this.setState(actions.loading(this.state, true));

      get(this.props.stakeholdersRes, query, function (err, data) {

        if (err) return console.log('error', err);

        _this6.setState(actions.loading(_this6.state, false));

        _this6.setState(actions.addStakeholdersItems(_this6.state, next, data));

        updateHref(Object.assign(getQuery() || {}, query));
      });
    }
  }, {
    key: 'setAgenda',
    value: function setAgenda(data) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {

        post(_this7.props.setAgendaRes + '/' + _this7.state.agenda.uid, data, function (err, result) {

          if (err) return reject(err);

          _this7.setState({ agenda: result.agenda });

          resolve(result);
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {

      return React.createElement(
        'div',
        { className: 'admin' },
        React.createElement(
          'div',
          { className: 'container-fluid' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(Search, {
              query: this.state.search.query,
              agendas: this.state.search.agendas,
              total: this.state.search.total,
              pageRange: this.state.search.pageRange,
              getSearchPage: this.getSearchPage,
              onSelectAgenda: this.onSelectAgenda,
              onSearchChange: this.onSearchChange,
              loading: this.state.loading
            }),
            React.createElement(Details, {
              agenda: this.state.agenda,
              stakeholders: this.state.stakeholders,
              total: this.state.stakeholdersTotal,
              pageRange: this.state.stakeholdersPageRange,
              getStakeholdersPage: this.getStakeholdersPage,
              setAgenda: this.setAgenda,
              updateHref: updateHref,
              getQuery: getQuery
            })
          )
        )
      );
    }
  }]);

  return Body;
}(React.Component), _class.propTypes = {
  searchRes: PropTypes.string,
  agendaRes: PropTypes.string,
  setAgendaRes: PropTypes.string,
  stakeholdersRes: PropTypes.string,

  agenda: PropTypes.object
}, _temp));

function updateHref(query) {

  var q = Object.assign({}, {
    oas: {
      search: ''
    },
    searchPage: 1,
    stakeholdersPage: 1,
    tab: 'stakeholders'
  }, query);

  if (q.searchPage <= 1) delete q.searchPage;
  if (q.oas.search == '') delete q.oas.search;
  if (q.stakeholdersPage <= 1) delete q.stakeholdersPage;
  if (q.tab == 'stakeholders') delete q.tab;

  _updateHref(q);
}