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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dec, _dec2, _dec3, _class, _class2, _temp2;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _reactRedux = require('react-redux');

var _reactRouterRedux = require('react-router-redux');

var _reduxForm = require('redux-form');

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _monitorBottomHit = require('dom-utils/monitorBottomHit2');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _Spinner = require('react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _Modal = require('react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _agendas = require('../../redux/modules/agendas');

var agendasActions = _interopRequireWildcard(_agendas);

var _events = require('../../redux/modules/events');

var eventsActions = _interopRequireWildcard(_events);

var _modals = require('../../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

var _components2 = require('../../components');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Events: {
    displayName: 'Events'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/Events/Events.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var selector = (0, _reduxForm.formValueSelector)('homeEvents');

var Events = _wrapComponent('Events')((_dec = (0, _reduxConnect.asyncConnect)([{
  deferred: !__CLIENT__,
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState,
        redirect = _ref.helpers.redirect;

    var state = getState();
    var query = state.routing.locationBeforeTransitions.query;
    var promises = [];

    if (state.settings.isNew) {
      return redirect('/');
    }

    if (!eventsActions.isLoaded(state)) {
      promises.push(dispatch(eventsActions.load(query)));
    }

    return Promise.all(__CLIENT__ ? [] : promises);
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state, props) {
  return {
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    events: state.events.data,
    page: state.events.page,
    total: state.events.total,
    loading: state.events.loading,
    listLoading: state.events.listLoading,
    nextLoading: state.events.nextLoading,
    search: selector(state, 'search'),
    perPageLimit: state.settings.perPageLimit,
    lang: state.settings.lang,
    modals: state.modals
  };
}, _extends({}, eventsActions, modalsActions, { agendasLoad: agendasActions.load, replace: _reactRouterRedux.replace })), _dec3 = (0, _reduxForm.reduxForm)({
  form: 'homeEvents'
}), _dec(_class = _dec2(_class = _dec3(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Events, _Component);

  function Events() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, Events);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Events.__proto__ || Object.getPrototypeOf(Events)).call.apply(_ref2, [this].concat(args))), _this), _this.search = function (values) {
      return _this.props.list(values).then(function () {
        _this.context.router.push(_extends({}, _this.props.location, {
          query: _extends({}, _this.props.location.query, { search: values.search || undefined })
        }));
      });
    }, _this.debouncedSearch = (0, _debounce2.default)(_this.props.handleSubmit(_this.search), 400), _this.nextPage = function () {
      var _this$props = _this.props,
          page = _this$props.page,
          total = _this$props.total,
          search = _this$props.search,
          loading = _this$props.loading,
          listLoading = _this$props.listLoading,
          nextLoading = _this$props.nextLoading,
          events = _this$props.events,
          perPageLimit = _this$props.perPageLimit;

      if (!events || !events.length || loading || listLoading || nextLoading || page * perPageLimit >= total) return;
      _this.props.nextPage({ search: search }, (page || 1) + 1);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Events, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (typeof document === 'undefined' || this.props.isNew) return;
      this.stopMonitorBottomHit = (0, _monitorBottomHit2.default)((0, _throttle2.default)(this.nextPage, 400, { trailing: false }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.stopMonitorBottomHit();
    }
  }, {
    key: 'getMultilangLabel',
    value: function getMultilangLabel(field) {
      if (field === null || (typeof field === 'undefined' ? 'undefined' : _typeof(field)) !== 'object') return field;
      return field[this.props.lang] || field[Object.keys(field)[0]];
    }
  }, {
    key: 'getEventShowLink',
    value: function getEventShowLink(event) {
      var res = this.props.res;


      if (!event.agenda) {
        return res.events.showWithoutAgenda.replace(':eventSlug', event.slug);
      }

      return res.events[event.private ? 'showPrivate' : 'show'].replace(':slug', event.agenda.slug).replace(':eventSlug', event.slug);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          res = _props.res,
          handleSubmit = _props.handleSubmit,
          events = _props.events,
          loading = _props.loading,
          listLoading = _props.listLoading,
          nextLoading = _props.nextLoading,
          search = _props.search,
          perPageLimit = _props.perPageLimit,
          total = _props.total,
          query = _props.location.query,
          showModal = _props.showModal,
          closeModal = _props.closeModal,
          modals = _props.modals,
          agendasLoad = _props.agendasLoad;
      var getLabel = this.context.getLabel;


      var selectAgendasModal = modals.selectAgenda || {};

      if (loading) {
        return _react3.default.createElement(_Spinner2.default, null);
      }

      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'div',
          { className: 'header' },
          _react3.default.createElement(
            'h2',
            { className: 'hidden-xs' },
            getLabel('myEvents')
          ),
          _react3.default.createElement(
            'div',
            { className: 'hidden-xs pull-right' },
            _react3.default.createElement(
              'a',
              {
                onClick: function onClick() {
                  return agendasLoad('selectAgendasForCreateEvent').then(function () {
                    return showModal('selectAgenda');
                  });
                },
                className: 'btn btn-primary',
                type: 'button'
              },
              getLabel('createEvent')
            )
          )
        ),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit(this.search) },
          _react3.default.createElement(_reduxForm.Field, {
            component: _components2.SearchInput,
            name: 'search',
            type: 'text',
            classNameGroup: 'search',
            className: 'form-control',
            placeholder: getLabel('searchEvent'),
            action: this.debouncedSearch,
            loading: listLoading,
            visible: search || query.search || total > perPageLimit
          })
        ),
        _react3.default.createElement(
          'div',
          { className: 'row' },
          events && events.map(function (event, i) {
            return _react3.default.createElement(
              'div',
              { className: 'event-item media', key: i },
              _react3.default.createElement(
                'div',
                { className: 'media-left' },
                _react3.default.createElement(
                  'a',
                  {
                    href: _this2.getEventShowLink(event)
                  },
                  _react3.default.createElement('img', {
                    className: 'media-object ill avatar',
                    src: event.image.base + event.image.filename,
                    alt: _this2.getMultilangLabel(event.title)
                  })
                )
              ),
              _react3.default.createElement(
                'div',
                { className: 'media-body' },
                _react3.default.createElement(
                  'div',
                  { className: 'title media-heading' },
                  _react3.default.createElement(
                    'div',
                    { className: 'agenda' },
                    event.agenda && event.agenda.title
                  ),
                  _react3.default.createElement(
                    'a',
                    { href: _this2.getEventShowLink(event) },
                    _react3.default.createElement(
                      'strong',
                      null,
                      _this2.getMultilangLabel(event.title)
                    )
                  ),
                  !!event.private && _react3.default.createElement(
                    'div',
                    { className: 'tooltip-icon' },
                    _react3.default.createElement('i', { className: 'fa fa-unlock-alt' }),
                    _react3.default.createElement(
                      'div',
                      { className: 'tooltip right', role: 'tooltip' },
                      _react3.default.createElement('div', { className: 'tooltip-arrow' }),
                      _react3.default.createElement(
                        'div',
                        { className: 'tooltip-inner' },
                        getLabel('privateEvent')
                      )
                    )
                  )
                ),
                _react3.default.createElement(
                  'div',
                  { className: 'actions' },
                  event.location && event.location.name
                ),
                _react3.default.createElement(
                  'div',
                  { className: 'actions' },
                  event.timerange
                )
              )
            );
          }),
          !events || !events.length && _react3.default.createElement(
            'div',
            { className: 'text-center text-muted margin-top-md' },
            getLabel('noResult')
          ),
          nextLoading && _react3.default.createElement(
            'div',
            { className: 'padding-v-md', style: { position: 'relative' } },
            _react3.default.createElement(_Spinner2.default, null)
          ),
          selectAgendasModal.visible && _react3.default.createElement(
            _Modal2.default,
            {
              title: getLabel('selectAgenda'),
              onClose: function onClose() {
                return closeModal('selectAgenda');
              },
              classNames: {
                overlay: 'popup-overlay big'
              },
              modalRef: function modalRef(ref) {
                _this2.selectAgendasModalRef = ref;
                _this2.forceUpdate();
              },
              disableBodyScroll: true
            },
            _react3.default.createElement(_components2.AgendasSearch, {
              id: 'selectAgendasForCreateEvent',
              refForLoadNextPage: this.selectAgendasModalRef,
              getTitleLink: function getTitleLink(agenda) {
                return res.agendas.addEvent.replace(':slug', agenda.slug);
              },
              createButtonIfEmpty: true
            })
          )
        )
      );
    }
  }]);

  return Events;
}(_react2.Component), _class2.propTypes = {
  list: _propTypes2.default.func,
  nextPage: _propTypes2.default.func,
  res: _propTypes2.default.object,
  events: _propTypes2.default.array,
  page: _propTypes2.default.number,
  total: _propTypes2.default.number,
  loading: _propTypes2.default.bool,
  listLoading: _propTypes2.default.bool,
  nextLoading: _propTypes2.default.bool,
  search: _propTypes2.default.string,
  perPageLimit: _propTypes2.default.number,
  showModal: _propTypes2.default.func,
  closeModal: _propTypes2.default.func,
  modals: _propTypes2.default.object
}, _class2.contextTypes = {
  router: _propTypes2.default.object,
  getLabel: _propTypes2.default.func
}, _temp2)) || _class) || _class) || _class));

exports.default = Events;
;
module.exports = exports['default'];