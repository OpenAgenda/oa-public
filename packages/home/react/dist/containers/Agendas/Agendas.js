'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _components2 = require('../../components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  Agendas: {
    displayName: 'Agendas'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/Agendas/Agendas.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var Agendas = _wrapComponent('Agendas')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    isNew: state.settings.isNew,
    loading: state.agendas.homeAgendas ? state.agendas.homeAgendas.loading : true,
    total: state.agendas.homeAgendas.total
  };
}), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(Agendas, _Component);

  function Agendas(props) {
    (0, _classCallCheck3.default)(this, Agendas);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Agendas.__proto__ || (0, _getPrototypeOf2.default)(Agendas)).call(this, props));

    _this.renderHeader = _this.renderHeader.bind(_this);
    _this.renderAgendaActions = _this.renderAgendaActions.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Agendas, [{
    key: 'renderHeader',
    value: function renderHeader() {
      var res = this.props.res;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        { className: 'header' },
        _react3.default.createElement(
          'h2',
          { className: 'hidden-xs' },
          getLabel('myAgendas')
        ),
        _react3.default.createElement(
          'div',
          { className: 'hidden-xs pull-right' },
          _react3.default.createElement(
            'a',
            { href: res.agendas.create, className: 'btn btn-primary', type: 'button' },
            getLabel('createAgenda')
          )
        )
      );
    }
  }, {
    key: 'renderAgendaActions',
    value: function renderAgendaActions(_ref) {
      var agenda = _ref.agenda;
      var res = this.props.res;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        { className: 'actions' },
        [2, 3].includes(agenda.stakeholder.credential) && _react3.default.createElement(
          'a',
          {
            href: res.agendas.moderate.replace(':slug', agenda.slug),
            className: 'text-muted'
          },
          agenda.stakeholder.credential === 2 ? getLabel('manage') : getLabel('moderate')
        ),
        [1, 2, 3].includes(agenda.stakeholder.credential) && _react3.default.createElement(
          'a',
          {
            href: res['agendas'].addEvent.replace(':slug', agenda.slug),
            className: 'text-muted'
          },
          getLabel('addAnEvent')
        ),
        ![2, 3].includes(agenda.stakeholder.credential) && _react3.default.createElement(
          'a',
          {
            href: res.agendas.contact.replace(':slug', agenda.slug),
            className: 'text-muted'
          },
          getLabel('contact')
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          isNew = _props.isNew,
          loading = _props.loading,
          query = _props.location.query,
          res = _props.res,
          total = _props.total;


      if (isNew && !total) {
        return _react3.default.createElement(_components2.Welcome, null);
      }

      if (loading) {
        return _react3.default.createElement(_Spinner2.default, null);
      }

      return _react3.default.createElement(_components2.AgendasSearch, {
        id: 'homeAgendas',
        destroyOnUnmount: false,
        initialValues: { search: query.search || '' },
        fieldIsVisible: function fieldIsVisible() {
          return query.search;
        },
        onSearch: function onSearch(values) {
          _this2.context.router.push((0, _extends3.default)({}, _this2.props.location, {
            query: (0, _extends3.default)({}, _this2.props.location.query, { search: values.search || undefined })
          }));
        },
        getTitleLink: function getTitleLink(agenda) {
          return res.agendas[agenda.private ? 'showPrivate' : 'show'].replace(':slug', agenda.slug);
        },
        Header: this.renderHeader,
        AgendaActionsComponent: this.renderAgendaActions
      });
    }
  }]);
  return Agendas;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  router: _propTypes2.default.object
}, _temp)) || _class));

exports.default = Agendas;
;
module.exports = exports['default'];
//# sourceMappingURL=Agendas.js.map