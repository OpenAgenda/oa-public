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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dec, _dec2, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _reduxForm = require('redux-form');

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _monitorBottomHit = require('dom-utils/monitorBottomHit');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _admin = require('labels/activities/admin');

var _admin2 = _interopRequireDefault(_admin);

var _formatActivity = require('activities/formatActivity');

var _formatActivity2 = _interopRequireDefault(_formatActivity);

var _activities = require('../../redux/modules/activities');

var activitiesActions = _interopRequireWildcard(_activities);

var _form = require('../../utils/form');

var _components2 = require('../../components');

require('moment/locale/fr');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  AdminDashboard: {
    displayName: 'AdminDashboard'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/AdminDashboard/AdminDashboard.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

_moment2.default.locale('fr');

var formatActivity = (0, _formatActivity2.default)({}, _admin2.default);

var dashboardValuesSelector = (0, _reduxForm.formValueSelector)('activityAppsAdminDashboard');

var AdminDashboard = _wrapComponent('AdminDashboard')((_dec = (0, _reduxConnect.asyncConnect)([{
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState;

    var state = getState();
    var query = state.routing.locationBeforeTransitions.query;

    if (!activitiesActions.isLoaded(state)) {
      return dispatch(activitiesActions.load(query));
    }
  }
}], function (state, props) {
  return {
    initialValues: {
      actor: props.location.query.actor || undefined,
      verb: props.location.query.verb || undefined,
      object: props.location.query.object || undefined,
      target: props.location.query.target || undefined,
      datetimeRange: props.location.query.datetimeRange || undefined
    },
    res: state.res,
    activities: state.activities.data,
    fromId: state.activities.fromId,
    loading: state.activities.loading,
    nextLoading: state.activities.nextLoading,
    lastPage: state.activities.lastPage,
    query: dashboardValuesSelector(state, 'actor', 'verb', 'object', 'target', 'datetimeRange')
  };
}, _extends({}, activitiesActions)), _dec2 = (0, _reduxForm.reduxForm)({
  form: 'activityAppsAdminDashboard'
}), _dec(_class = _dec2(_class = (_temp = _class2 = function (_Component) {
  _inherits(AdminDashboard, _Component);

  function AdminDashboard(props) {
    _classCallCheck(this, AdminDashboard);

    var _this = _possibleConstructorReturn(this, (AdminDashboard.__proto__ || Object.getPrototypeOf(AdminDashboard)).call(this, props));

    _this.search = function (values) {
      return _this.props.list(values).then(function () {
        var newQuery = (0, _pick2.default)(values, ['actor', 'verb', 'object', 'target', 'datetimeRange']);
        _this.context.router.push(_extends({}, _this.props.location, {
          query: _extends({}, _this.props.location.query, {
            actor: undefined,
            verb: undefined,
            object: undefined,
            target: undefined,
            datetimeRange: undefined
          }, newQuery)
        }));
      });
    };

    _this.debouncedSearch = (0, _debounce2.default)(_this.props.handleSubmit(_this.search), 400);

    _this.nextPage = function () {
      var _this$props = _this.props,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          activities = _this$props.activities,
          query = _this$props.query,
          nextPage = _this$props.nextPage,
          lastPage = _this$props.lastPage;

      if (!activities || !activities.length || loading || nextLoading || lastPage) return;
      nextPage(query, activities[activities.length - 1].id);
    };

    _this.renderField = _form.renderField.bind(_this);
    _this.renderSelect = _form.renderSelect.bind(_this);
    _this.renderInput = _form.renderInput.bind(_this);
    _this.renderReactSelect = _this.renderReactSelect.bind(_this);
    _this.renderDateTimeRangePicker = _this.renderDateTimeRangePicker.bind(_this);
    return _this;
  }

  _createClass(AdminDashboard, [{
    key: 'renderReactSelect',
    value: function renderReactSelect(_ref2) {
      var className = _ref2.className,
          placeholder = _ref2.placeholder,
          options = _ref2.options,
          instanceId = _ref2.instanceId,
          props = _objectWithoutProperties(_ref2, ['className', 'placeholder', 'options', 'instanceId']);

      var inputAttrs = { className: className, options: options, placeholder: placeholder, instanceId: instanceId };

      var content = _react3.default.createElement(_reactSelect2.default, _extends({}, props.input, inputAttrs));

      return this.renderField(_extends({ content: content }, props));
    }
  }, {
    key: 'renderDateTimeRangePicker',
    value: function renderDateTimeRangePicker(field) {
      var _this2 = this;

      var handleEvent = function handleEvent(event, picker) {

        var range = picker.startDate.format() + '|' + picker.endDate.format();
        _this2.props.dispatch(_this2.props.change(field.input.name, range));
      };

      var _split = (field.input.value || '').split('|'),
          _split2 = _slicedToArray(_split, 2),
          _split2$ = _split2[0],
          startValue = _split2$ === undefined ? '' : _split2$,
          _split2$2 = _split2[1],
          endValue = _split2$2 === undefined ? '' : _split2$2;

      return _react3.default.createElement(_components2.DateTimePicker, {
        handleEvent: handleEvent,
        startValue: startValue && (0, _moment2.default)(startValue),
        endValue: endValue && (0, _moment2.default)(endValue)
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (typeof document === 'undefined') return;
      (0, _monitorBottomHit2.default)((0, _throttle2.default)(this.nextPage, 400, { trailing: false }));
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
          handleSubmit = _props.handleSubmit,
          reset = _props.reset,
          activities = _props.activities,
          nextLoading = _props.nextLoading;
      var getLabel = this.context.getLabel;


      return _react3.default.createElement(
        'div',
        { className: 'container-fluid' },
        _react3.default.createElement(
          'h2',
          null,
          'Activit\xE9s'
        ),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit(this.search) },
          _react3.default.createElement(
            'div',
            { className: 'row' },
            _react3.default.createElement(
              'div',
              { className: 'col-md-3' },
              _react3.default.createElement(_reduxForm.Field, {
                label: 'Actor',
                component: this.renderInput,
                name: 'actor',
                type: 'text',
                className: 'form-control',
                classNameGroup: 'margin-top-md margin-bottom-lg'
              })
            ),
            _react3.default.createElement(
              'div',
              { className: 'col-md-3' },
              _react3.default.createElement(
                _reduxForm.Field,
                {
                  label: 'Verb',
                  component: this.renderSelect,
                  name: 'verb',
                  type: 'select',
                  classNameGroup: 'margin-top-md margin-bottom-lg',
                  className: 'form-control',
                  placeholder: 'S\xE9l\xE9ctionner'
                },
                _react3.default.createElement(
                  'option',
                  { value: '' },
                  'S\xE9l\xE9ctionner'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.sendInvitation' },
                  'agenda.sendInvitation'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.acceptInvitation' },
                  'agenda.acceptInvitation'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.addMember' },
                  'agenda.addMember'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.setMemberRole' },
                  'agenda.setMemberRole'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.create' },
                  'agenda.create'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.updateContribution' },
                  'agenda.updateContribution'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.updateProfile' },
                  'agenda.updateProfile'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.rename' },
                  'agenda.rename'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.changeEventState' },
                  'agenda.changeEventState'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.publishEvent' },
                  'agenda.publishEvent'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.unpublishEvent' },
                  'agenda.unpublishEvent'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.removeEvent' },
                  'agenda.removeEvent'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'agenda.setOfficial' },
                  'agenda.setOfficial'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'event.create' },
                  'event.create'
                ),
                _react3.default.createElement(
                  'option',
                  { value: 'event.update' },
                  'event.update'
                )
              )
            ),
            _react3.default.createElement(
              'div',
              { className: 'col-md-3' },
              _react3.default.createElement(_reduxForm.Field, {
                label: 'Object',
                component: this.renderInput,
                name: 'object',
                type: 'text',
                className: 'form-control',
                classNameGroup: 'margin-top-md margin-bottom-lg'
              })
            ),
            _react3.default.createElement(
              'div',
              { className: 'col-md-3' },
              _react3.default.createElement(_reduxForm.Field, {
                label: 'Target',
                component: this.renderInput,
                name: 'target',
                type: 'text',
                className: 'form-control',
                classNameGroup: 'margin-top-md margin-bottom-lg'
              })
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'row' },
            _react3.default.createElement(
              'div',
              { className: 'col-md-3' },
              _react3.default.createElement(_reduxForm.Field, {
                name: 'datetimeRange',
                component: this.renderDateTimeRangePicker
              })
            ),
            _react3.default.createElement(
              'div',
              { className: 'col-md-3' },
              _react3.default.createElement(
                'button',
                { className: 'btn btn-primary margin-right-sm', type: 'submit' },
                'Rechercher'
              ),
              _react3.default.createElement(
                'button',
                { className: 'btn btn-default', type: 'button', onClick: reset },
                'Reset'
              )
            )
          )
        ),
        _react3.default.createElement(
          'div',
          { className: 'row padding-top-md' },
          _react3.default.createElement(
            'div',
            { className: 'col-md-offset-3 col-md-6' },
            activities && activities.length > 0 && _react3.default.createElement(
              'ul',
              { className: 'list-unstyled' },
              activities.map(function (activity) {
                return _react3.default.createElement(
                  'li',
                  { key: activity.id, className: 'padding-bottom-xs' },
                  _react3.default.createElement(
                    'label',
                    { className: 'pull-left margin-right-sm small' },
                    (0, _moment2.default)(activity.createdAt).format('LLL')
                  ),
                  _react3.default.createElement('p', { dangerouslySetInnerHTML: { __html: formatActivity(activity) } })
                );
              })
            ),
            (!activities || activities.length === 0) && _react3.default.createElement(
              'div',
              { className: 'margin-bottom-sm' },
              getLabel('noActivity')
            ),
            nextLoading && _react3.default.createElement(
              'div',
              { className: 'padding-v-md', style: { position: 'relative' } },
              _react3.default.createElement(_Spinner2.default, null)
            )
          )
        )
      );
    }
  }]);

  return AdminDashboard;
}(_react2.Component), _class2.propTypes = {
  list: _propTypes2.default.func,
  nextPage: _propTypes2.default.func,
  res: _propTypes2.default.object,
  activities: _propTypes2.default.array,
  fromId: _propTypes2.default.number,
  loading: _propTypes2.default.bool,
  nextLoading: _propTypes2.default.bool,
  lastPage: _propTypes2.default.bool
}, _class2.contextTypes = {
  router: _propTypes2.default.object,
  getLabel: _propTypes2.default.func
}, _temp)) || _class) || _class));

exports.default = AdminDashboard;
;
module.exports = exports['default'];