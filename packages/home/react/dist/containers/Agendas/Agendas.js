'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _reactRedux = require('react-redux');

var _Spinner = require('react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _agendas = require('../../redux/modules/agendas');

var agendasActions = _interopRequireWildcard(_agendas);

var _components2 = require('../../components');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Agendas = _wrapComponent('Agendas')((_dec = (0, _reduxConnect.asyncConnect)([{
  deferred: !__CLIENT__,
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState;

    var state = getState();
    var query = state.routing.locationBeforeTransitions.query;
    var promises = [];

    if (!agendasActions.isLoaded('homeAgendas', state)) {
      promises.push(dispatch(agendasActions.load('homeAgendas', query)));
    }

    return Promise.all(__CLIENT__ ? [] : promises);
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    res: state.res,
    isNew: state.settings.isNew,
    loading: state.agendas['homeAgendas'] ? state.agendas['homeAgendas'].loading : true
  };
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  _inherits(Agendas, _Component);

  function Agendas(props) {
    _classCallCheck(this, Agendas);

    var _this = _possibleConstructorReturn(this, (Agendas.__proto__ || Object.getPrototypeOf(Agendas)).call(this, props));

    _this.renderHeader = _this.renderHeader.bind(_this);
    _this.renderAgendaActions = _this.renderAgendaActions.bind(_this);
    return _this;
  }

  _createClass(Agendas, [{
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
    value: function renderAgendaActions(_ref2) {
      var agenda = _ref2.agenda;
      var res = this.props.res;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        { className: 'actions' },
        agenda.stakeholder.credential > 1 && _react3.default.createElement(
          'a',
          {
            href: res.moderate.replace(':slug', agenda.slug),
            className: 'text-muted'
          },
          agenda.stakeholder.credential == 2 ? getLabel('manage') : getLabel('moderate')
        ),
        _react3.default.createElement(
          'a',
          { href: res['agendas'].addEvent.replace(':slug', agenda.slug), className: 'text-muted' },
          getLabel('addAnEvent')
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
          res = _props.res;


      if (isNew) {
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
          _this2.context.router.push(_extends({}, _this2.props.location, {
            query: _extends({}, _this2.props.location.query, { search: values.search || undefined })
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
}, _temp)) || _class) || _class));

exports.default = Agendas;
;
module.exports = exports['default'];