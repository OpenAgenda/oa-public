"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec, _class, _class2, _temp2;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

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
  UserDashboard: {
    displayName: 'UserDashboard'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/UserDashboard/UserDashboard.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var UserDashboard = _wrapComponent('UserDashboard')((_dec = (0, _reduxConnect.asyncConnect)([{
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
    lastPage: state.activities.lastPage
  };
}, (0, _extends3.default)({}, activitiesActions)), _dec(_class = (_temp2 = _class2 = function (_Component) {
  (0, _inherits3.default)(UserDashboard, _Component);

  function UserDashboard() {
    var _ref2;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, UserDashboard);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref2 = UserDashboard.__proto__ || (0, _getPrototypeOf2.default)(UserDashboard)).call.apply(_ref2, [this].concat(args))), _this), _this.nextPage = function () {
      var _this$props = _this.props,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          activities = _this$props.activities,
          query = _this$props.query,
          nextPage = _this$props.nextPage,
          lastPage = _this$props.lastPage;

      if (!activities || !activities.length || loading || nextLoading || lastPage) return;
      nextPage(query, activities[activities.length - 1].id);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(UserDashboard, [{
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
    key: 'render',
    value: function render() {
      var _props = this.props,
          activities = _props.activities,
          nextLoading = _props.nextLoading;
      var _context = this.context,
          getLabel = _context.getLabel,
          lang = _context.lang;


      return _react3.default.createElement(
        'div',
        { className: 'content' },
        _react3.default.createElement(
          'h2',
          { className: 'margin-bottom-md' },
          getLabel('activities')
        ),
        activities && activities.length > 0 && _react3.default.createElement(
          'ul',
          { className: 'list-unstyled activity-list' },
          activities.map(function (a) {
            return _react3.default.createElement(_components2.ActivityItem, { activity: a, lang: lang });
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
      );
    }
  }]);
  return UserDashboard;
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
}, _temp2)) || _class));

exports.default = UserDashboard;
;
module.exports = exports['default'];
//# sourceMappingURL=UserDashboard.js.map