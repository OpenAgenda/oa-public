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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dec, _dec2, _class, _class2, _temp2;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.throttle');

var _lodash4 = _interopRequireDefault(_lodash3);

var _monitorBottomHit = require('dom-utils/monitorBottomHit');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _Modal = require('react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _agenda = require('../../redux/modules/agenda');

var agendaActions = _interopRequireWildcard(_agenda);

var _sources = require('../../redux/modules/sources');

var sourcesActions = _interopRequireWildcard(_sources);

var _modals = require('../../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Dashboard: {
    displayName: 'Dashboard'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/Dashboard/Dashboard.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var selector = (0, _reduxForm.formValueSelector)('aggregatorSourcesDashboard');

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

var Dashboard = _wrapComponent('Dashboard')((_dec = (0, _reduxConnect.asyncConnect)([{
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState;

    var state = getState();
    var query = state.routing.locationBeforeTransitions.query;

    if (!sourcesActions.isLoaded(state)) {
      return dispatch(sourcesActions.load(query));
    }
  }
}], function (state, props) {
  return {
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    agendas: state.sources.data,
    page: state.sources.page,
    total: state.sources.total,
    loading: state.sources.loading,
    nextLoading: state.sources.nextLoading,
    search: selector(state, 'search'),
    agenda: state.agenda,
    perPageLimit: state.settings.perPageLimit,
    modals: state.modals
  };
}, _extends({}, sourcesActions, modalsActions, agendaActions)), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'aggregatorSourcesDashboard'
}), _dec(_class = _dec2(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Dashboard, _Component);

  function Dashboard() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, Dashboard);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call.apply(_ref2, [this].concat(args))), _this), _this.renderField = function (_ref3) {
      var content = _ref3.content,
          _ref3$input = _ref3.input,
          name = _ref3$input.name,
          value = _ref3$input.value,
          label = _ref3.label,
          subLabel = _ref3.subLabel,
          max = _ref3.max,
          classNameGroup = _ref3.classNameGroup,
          _ref3$visible = _ref3.visible,
          visible = _ref3$visible === undefined ? true : _ref3$visible,
          errorOnDirty = _ref3.errorOnDirty,
          _ref3$meta = _ref3.meta,
          touched = _ref3$meta.touched,
          error = _ref3$meta.error,
          dirty = _ref3$meta.dirty;

      var displayError = errorOnDirty ? dirty || touched : touched;

      if (!visible) return _react3.default.createElement('div', null);

      return _react3.default.createElement(
        'div',
        { className: 'form-group ' + classNameGroup + ' ' + (displayError && error ? 'has-error has-feedback' : '') },
        label && _react3.default.createElement(
          'label',
          { htmlFor: name },
          label
        ),
        subLabel,
        content,
        displayError && error && _react3.default.createElement(
          'span',
          { className: 'form-control-feedback' },
          _react3.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' })
        ),
        displayError && error && _react3.default.createElement(
          'div',
          { className: 'text-danger ' + (max && 'pull-left' || '') },
          _this.context.getLabel(error)
        ),
        max && _react3.default.createElement(
          'div',
          { className: 'text-right ' + (max - value.length < 0 && 'text-danger' || '') },
          max - value.length
        )
      );
    }, _this.renderSearchInput = function (_ref4) {
      var type = _ref4.type,
          placeholder = _ref4.placeholder,
          className = _ref4.className,
          spellCheck = _ref4.spellCheck,
          action = _ref4.action,
          loading = _ref4.loading,
          props = _objectWithoutProperties(_ref4, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);

      var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
      var onChange = function onChange(e) {
        props.input.onChange(e.target.value);
        action();
      };
      var content = _react3.default.createElement(
        'div',
        { className: 'input-icon-right' },
        _react3.default.createElement('input', _extends({}, props.input, inputAttrs, { onChange: onChange })),
        _react3.default.createElement(
          'button',
          { type: 'submit', className: 'btn' },
          loading ? _react3.default.createElement(_Spinner2.default, { spinner: searchSpinner }) : _react3.default.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true' })
        )
      );
      return _this.renderField(_extends({ content: content }, props));
    }, _this.search = function (values) {
      return _this.props.list(values).then(function () {
        _this.context.router.push(_extends({}, _this.props.location, {
          query: _extends({}, _this.props.location.query, { search: values.search || undefined })
        }));
      });
    }, _this.debouncedSearch = (0, _lodash2.default)(_this.props.handleSubmit(_this.search), 400), _this.nextPage = function () {
      var _this$props = _this.props,
          page = _this$props.page,
          total = _this$props.total,
          search = _this$props.search,
          loading = _this$props.loading,
          agendas = _this$props.agendas;

      if (!agendas || !agendas.length || loading || page * _this.props.perPageLimit >= total) return;
      _this.props.nextPage({ search: search }, (page || 1) + 1);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Dashboard, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (typeof document === 'undefined') return;
      (0, _monitorBottomHit2.default)((0, _lodash4.default)(this.nextPage, 400, { trailing: false }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _monitorBottomHit2.default.stop();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          res = _props.res,
          handleSubmit = _props.handleSubmit,
          agendas = _props.agendas,
          total = _props.total,
          loading = _props.loading,
          nextLoading = _props.nextLoading,
          showModal = _props.showModal,
          closeModal = _props.closeModal,
          modals = _props.modals,
          remove = _props.remove,
          createAggregator = _props.createAggregator,
          search = _props.search,
          agenda = _props.agenda,
          perPageLimit = _props.perPageLimit,
          query = _props.location.query;
      var getLabel = this.context.getLabel;


      var removeModal = modals.removeSource || {};

      if (!agenda.isAggregator) {

        return _react3.default.createElement(
          'div',
          { className: 'margin-top-sm text-center' },
          _react3.default.createElement(
            'p',
            null,
            getLabel('aggregatorExplanation')
          ),
          _react3.default.createElement(
            'div',
            { className: 'margin-v-lg' },
            _react3.default.createElement(
              'button',
              { className: 'btn btn-primary', onClick: createAggregator },
              getLabel('createAggregator')
            )
          )
        );
      }

      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'div',
          { className: 'header' },
          _react3.default.createElement(
            'h2',
            null,
            getLabel('sourceAgendas')
          ),
          _react3.default.createElement('p', {
            className: 'text-muted',
            dangerouslySetInnerHTML: {
              __html: getLabel('sourcesExplanation', { title: '<a href="' + res.show.replace(':slug', agenda.slug) + '">' + agenda.title + '</a>' })
            }
          }),
          _react3.default.createElement('p', {
            className: 'text-muted',
            dangerouslySetInnerHTML: {
              __html: getLabel('addSources', { searchLink: res.search })
            }
          }),
          _react3.default.createElement(
            'form',
            { onSubmit: handleSubmit(this.search) },
            _react3.default.createElement(_reduxForm.Field, {
              component: this.renderSearchInput,
              name: 'search',
              type: 'text',
              classNameGroup: 'search margin-v-md',
              className: 'form-control',
              placeholder: getLabel('searchAgenda'),
              action: this.debouncedSearch,
              loading: loading,
              visible: search || query.search || total >= perPageLimit
            })
          )
        ),
        _react3.default.createElement(
          'div',
          null,
          agendas && agendas.map(function (agendaItem) {
            return _react3.default.createElement(
              'div',
              { className: 'agenda-item media', key: agendaItem.uid },
              _react3.default.createElement(
                'div',
                { className: 'media-left' },
                _react3.default.createElement(
                  'a',
                  { href: res.show.replace(':slug', agendaItem.slug) },
                  _react3.default.createElement('img', { className: 'media-object ill avatar', src: agendaItem.image, alt: agendaItem.title })
                )
              ),
              _react3.default.createElement(
                'div',
                { className: 'media-body' },
                _react3.default.createElement(
                  'div',
                  { className: 'title media-heading' },
                  _react3.default.createElement(
                    'a',
                    { href: res.show.replace(':slug', agendaItem.slug) },
                    _react3.default.createElement(
                      'strong',
                      null,
                      agendaItem.title
                    )
                  ),
                  !!agendaItem.official && _react3.default.createElement(
                    'div',
                    { className: 'official' },
                    _react3.default.createElement('i', null),
                    _react3.default.createElement(
                      'div',
                      { className: 'tooltip right', role: 'tooltip' },
                      _react3.default.createElement('div', { className: 'tooltip-arrow' }),
                      _react3.default.createElement(
                        'div',
                        { className: 'tooltip-inner' },
                        getLabel('officialAgenda')
                      )
                    )
                  )
                ),
                _react3.default.createElement(
                  'div',
                  { className: 'actions' },
                  _react3.default.createElement(
                    'a',
                    {
                      role: 'button',
                      onClick: function onClick() {
                        return showModal('removeSource', { uid: agendaItem.uid });
                      },
                      className: 'text-muted'
                    },
                    getLabel('removeSource')
                  )
                )
              )
            );
          }),
          !agendas || !agendas.length ? _react3.default.createElement(
            'div',
            { className: 'text-center text-muted margin-v-md' },
            getLabel('noResult')
          ) : null,
          nextLoading && _react3.default.createElement(
            'div',
            { className: 'padding-v-md', style: { position: 'relative' } },
            _react3.default.createElement(_Spinner2.default, null)
          )
        ),
        _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('removeSource'),
            visible: removeModal.visible || false,
            onClose: function onClose() {
              return closeModal('removeSource');
            }
          },
          _react3.default.createElement(
            'p',
            { className: 'margin-top-sm' },
            getLabel('removeConfirmMessage')
          ),
          _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'button',
              {
                className: 'btn btn-danger',
                onClick: function onClick() {
                  return remove(removeModal.uid).then(function () {
                    return closeModal('removeSource');
                  });
                }
              },
              getLabel('removeSource')
            )
          )
        )
      );
    }
  }]);

  return Dashboard;
}(_react2.Component), _class2.propTypes = {
  list: _propTypes2.default.func,
  remove: _propTypes2.default.func,
  nextPage: _propTypes2.default.func,
  res: _propTypes2.default.object,
  agendas: _propTypes2.default.array,
  page: _propTypes2.default.number,
  total: _propTypes2.default.number,
  loading: _propTypes2.default.bool,
  nextLoading: _propTypes2.default.bool,
  search: _propTypes2.default.string,
  slug: _propTypes2.default.string,
  perPageLimit: _propTypes2.default.number,
  modals: _propTypes2.default.object
}, _class2.contextTypes = {
  router: _propTypes2.default.object,
  getLabel: _propTypes2.default.func
}, _temp2)) || _class) || _class));

exports.default = Dashboard;
;
module.exports = exports['default'];