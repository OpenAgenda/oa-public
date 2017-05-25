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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class, _class2, _temp2;

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _monitorBottomHit = require('dom-utils/monitorBottomHit2');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _agendas = require('../../redux/modules/agendas');

var agendasActions = _interopRequireWildcard(_agendas);

var _ = require('../');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  AgendasSearch: {
    displayName: 'AgendasSearch'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/components/AgendasSearch/AgendasSearch.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var componentPropTypes = _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.func, _propTypes2.default.string]);

var AgendasSearch = _wrapComponent('AgendasSearch')((_dec = (0, _reactRedux.connect)(function (state, props) {
  var selector = (0, _reduxForm.formValueSelector)(props.id);

  return {
    form: props.id,
    res: state.res,
    agendas: state.agendas[props.id].data,
    page: state.agendas[props.id].page,
    total: state.agendas[props.id].total,
    loading: state.agendas[props.id].loading,
    search: selector(state, 'search'),
    perPageLimit: state.settings.perPageLimit
  };
}, agendasActions), _dec2 = (0, _reduxForm.reduxForm)(), _dec(_class = _dec2(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(AgendasSearch, _Component);

  function AgendasSearch() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, AgendasSearch);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AgendasSearch.__proto__ || Object.getPrototypeOf(AgendasSearch)).call.apply(_ref, [this].concat(args))), _this), _this.search = function (values) {
      return _this.props.list(_this.props.id, values).then(function () {
        if (_this.props.onSearch) return _this.props.onSearch(values);
      });
    }, _this.debouncedSearch = (0, _debounce2.default)(_this.props.handleSubmit(_this.search), 400), _this.nextPage = function () {
      var _this$props = _this.props,
          page = _this$props.page,
          total = _this$props.total,
          search = _this$props.search,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          agendas = _this$props.agendas,
          perPageLimit = _this$props.perPageLimit;

      if (!agendas || !agendas.length || loading || nextLoading || page * perPageLimit >= total) return;
      _this.props.nextPage(_this.props.id, { search: search }, (page || 1) + 1);
    }, _this.throttledNextPage = (0, _throttle2.default)(_this.nextPage, 400, { trailing: false }), _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AgendasSearch, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (typeof document === 'undefined' || this.props.isNew) return;

      this.stopMonitorBottomHit = (0, _monitorBottomHit2.default)(this.throttledNextPage);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (!prevProps.refForLoadNextPage && this.props.refForLoadNextPage) {

        this.stopMonitorBottomHit = (0, _monitorBottomHit2.default)(_reactDom2.default.findDOMNode(this.props.refForLoadNextPage), this.throttledNextPage);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.stopMonitorBottomHit) this.stopMonitorBottomHit();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          Header = _props.Header,
          getTitleLink = _props.getTitleLink,
          res = _props.res,
          handleSubmit = _props.handleSubmit,
          agendas = _props.agendas,
          loading = _props.loading,
          nextLoading = _props.nextLoading,
          createButtonIfEmpty = _props.createButtonIfEmpty,
          search = _props.search,
          perPageLimit = _props.perPageLimit,
          total = _props.total,
          fieldIsVisible = _props.fieldIsVisible,
          AgendaActionsComponent = _props.AgendaActionsComponent;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        null,
        (0, _react2.createElement)(Header),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit(this.search) },
          _react3.default.createElement(_reduxForm.Field, {
            component: _.SearchInput,
            name: 'search',
            type: 'text',
            classNameGroup: 'search',
            className: 'form-control',
            placeholder: getLabel('searchAgenda'),
            action: this.debouncedSearch,
            loading: loading,
            visible: search || fieldIsVisible() || total > perPageLimit
          })
        ),
        _react3.default.createElement(_.AgendasList, {
          getTitleLink: getTitleLink,
          agendas: agendas,
          ActionsComponent: AgendaActionsComponent
        }),
        !agendas || !agendas.length && _react3.default.createElement(
          'div',
          { className: 'text-center text-muted margin-top-md' },
          getLabel('noResult')
        ),
        (!agendas || !agendas.length) && createButtonIfEmpty && _react3.default.createElement(
          'div',
          { className: 'text-center text-muted margin-top-md' },
          _react3.default.createElement(
            'a',
            { className: 'btn btn-primary', href: res.agendas.create },
            getLabel('createAgenda')
          )
        ),
        nextLoading && _react3.default.createElement(
          'div',
          { className: 'padding-v-md', style: { position: 'relative' } },
          _react3.default.createElement(_Spinner2.default, null)
        )
      );
    }
  }]);

  return AgendasSearch;
}(_react2.Component), _class2.propTypes = {
  id: _propTypes2.default.string.isRequired,
  Header: componentPropTypes,
  AgendaActionsComponent: componentPropTypes,
  list: _propTypes2.default.func,
  nextPage: _propTypes2.default.func,
  res: _propTypes2.default.object,
  agendas: _propTypes2.default.array,
  page: _propTypes2.default.number,
  total: _propTypes2.default.number,
  loading: _propTypes2.default.bool,
  nextLoading: _propTypes2.default.bool,
  search: _propTypes2.default.string,
  perPageLimit: _propTypes2.default.number,
  fieldIsVisible: _propTypes2.default.func,
  getTitleLink: _propTypes2.default.func,
  createButtonIfEmpty: _propTypes2.default.bool
}, _class2.contextTypes = {
  router: _propTypes2.default.object,
  getLabel: _propTypes2.default.func
}, _class2.defaultProps = {
  Header: function Header() {
    return null;
  },
  AgendaActionsComponent: function AgendaActionsComponent() {
    return null;
  },
  fieldIsVisible: function fieldIsVisible() {
    return true;
  }
}, _temp2)) || _class) || _class));

exports.default = AgendasSearch;
module.exports = exports['default'];