'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _monitorBottomHit = require('@openagenda/dom-utils/monitorBottomHit');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _activities = require('../../redux/modules/activities');

var activitiesActions = _interopRequireWildcard(_activities);

var _components2 = require('../../components');

require('moment/locale/fr');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  AgendaDashboard: {
    displayName: 'AgendaDashboard'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/AgendaDashboard/AgendaDashboard.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var AgendaDashboard = _wrapComponent('AgendaDashboard')((_dec = (0, _reduxConnect.asyncConnect)([{
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
    res: state.res,
    activities: state.activities.data,
    fromId: state.activities.fromId,
    loading: state.activities.loading,
    nextLoading: state.activities.nextLoading,
    lastPage: state.activities.lastPage,
    query: (0, _pick2.default)(props.location.query, ['actor', 'verb', 'object', 'target'])
  };
}, (0, _extends7.default)({}, activitiesActions)), _dec(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(AgendaDashboard, _Component);

  function AgendaDashboard(props) {
    (0, _classCallCheck3.default)(this, AgendaDashboard);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AgendaDashboard.__proto__ || (0, _getPrototypeOf2.default)(AgendaDashboard)).call(this, props));

    _this.state = {
      filters: _this.getFilters((0, _pick2.default)(_this.props.location.query, ['actor', 'verb', 'object', 'target']))
    };


    _this.onActivityClick = _this.onActivityClick.bind(_this);
    _this.nextPage = _this.nextPage.bind(_this);
    _this.getFilters = _this.getFilters.bind(_this);
    _this.removeFilter = _this.removeFilter.bind(_this);
    _this.updateMonitorBottomHit = _this.updateMonitorBottomHit.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(AgendaDashboard, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var lang = this.context.lang;

      _moment2.default.locale(lang);

      if (typeof document !== 'undefined') {
        (0, _monitorBottomHit2.default)((0, _throttle2.default)(this.nextPage, 400, { trailing: false }));
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _monitorBottomHit2.default.stop();
    }
  }, {
    key: 'updateMonitorBottomHit',
    value: function updateMonitorBottomHit() {
      _monitorBottomHit2.default.stop();
      (0, _monitorBottomHit2.default)((0, _throttle2.default)(this.nextPage, 400, { trailing: false }));
    }
  }, {
    key: 'getFilters',
    value: function getFilters(values) {
      var activities = this.props.activities;


      var usefullActivities = {
        actor: activities.find(function (v) {
          return v.actor === values.actor;
        }),
        verb: activities.find(function (v) {
          return v.verb === values.verb;
        }),
        object: activities.find(function (v) {
          return v.object === values.object;
        }),
        target: activities.find(function (v) {
          return v.target === values.target;
        })
      };

      return (0, _mapValues2.default)(usefullActivities, function (v, k) {
        return v ? {
          label: v.store.labels[k],
          value: v[k]
        } : undefined;
      });
    }
  }, {
    key: 'removeFilter',
    value: function removeFilter(type) {
      var _this2 = this;

      var _props = this.props,
          list = _props.list,
          location = _props.location,
          query = _props.query;
      var router = this.context.router;


      this.setState((0, _immutabilityHelper2.default)(this.state, {
        filters: {
          $unset: [type]
        }
      }), function () {
        list((0, _extends7.default)({}, query, (0, _defineProperty3.default)({}, type, undefined))).then(_this2.updateMonitorBottomHit);
      });

      router.replace((0, _extends7.default)({}, location, {
        query: (0, _extends7.default)({}, location.query, (0, _defineProperty3.default)({}, type, undefined))
      }));
    }
  }, {
    key: 'nextPage',
    value: function nextPage() {
      var _props2 = this.props,
          loading = _props2.loading,
          nextLoading = _props2.nextLoading,
          activities = _props2.activities,
          query = _props2.query,
          nextPage = _props2.nextPage,
          lastPage = _props2.lastPage;

      if (!activities || !activities.length || loading || nextLoading || lastPage) return;
      nextPage(query, activities[activities.length - 1].id);
    }
  }, {
    key: 'onActivityClick',
    value: function onActivityClick(e) {
      var _this3 = this;

      var _props3 = this.props,
          location = _props3.location,
          query = _props3.query,
          list = _props3.list;
      var router = this.context.router;


      if (!e.target.hasAttribute('data-filtertype') || !e.target.hasAttribute('data-filterlabel') || !e.target.hasAttribute('data-filtervalue')) {
        return;
      }

      var type = e.target.getAttribute('data-filtertype');
      var label = e.target.getAttribute('data-filterlabel');
      var value = e.target.getAttribute('data-filtervalue');

      this.setState((0, _immutabilityHelper2.default)(this.state, {
        filters: (0, _defineProperty3.default)({}, type, {
          $set: {
            label: label,
            value: value
          }
        })
      }), function () {
        list((0, _extends7.default)({}, query, (0, _defineProperty3.default)({}, type, value))).then(_this3.updateMonitorBottomHit);
      });

      router.replace((0, _extends7.default)({}, location, {
        query: (0, _extends7.default)({}, location.query, (0, _defineProperty3.default)({}, type, value))
      }));
    }
  }, {
    key: 'getEventTitle',
    value: function getEventTitle(labels) {

      if ((typeof labels === 'undefined' ? 'undefined' : (0, _typeof3.default)(labels)) !== 'object') return labels;

      var lang = this.props.lang;

      var keys = (0, _keys2.default)(labels);
      return keys.find(function (v) {
        return v === lang;
      }) ? labels[lang] : labels[keys[0]];
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props4 = this.props,
          activities = _props4.activities,
          nextLoading = _props4.nextLoading;
      var _context = this.context,
          getLabel = _context.getLabel,
          lang = _context.lang;


      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'h2',
          null,
          getLabel('activities')
        ),
        _react3.default.createElement(
          'div',
          { className: 'margin-v-md' },
          _react3.default.createElement(
            'ul',
            { className: 'nav nav-pills filters' },
            (0, _values2.default)((0, _mapValues2.default)(this.state.filters, function (v, k) {
              return v && _react3.default.createElement(
                'li',
                { key: k, onClick: function onClick() {
                    return _this4.removeFilter(k);
                  }, className: 'active margin-right-sm' },
                _react3.default.createElement(
                  'a',
                  { role: 'button' },
                  _this4.getEventTitle(v.label)
                )
              );
            }))
          )
        ),
        _react3.default.createElement(
          'div',
          { className: 'padding-top-md' },
          activities && activities.length > 0 && _react3.default.createElement(
            'ul',
            { className: 'list-unstyled activity-list' },
            activities.map(function (a) {
              return _react3.default.createElement(_components2.ActivityItem, { activity: a, lang: lang, withFilterIcons: true });
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
      );
    }
  }]);
  return AgendaDashboard;
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
  lang: _propTypes2.default.string,
  getLabel: _propTypes2.default.func
}, _temp)) || _class));

exports.default = AgendaDashboard;
;
module.exports = exports['default'];
//# sourceMappingURL=AgendaDashboard.js.map