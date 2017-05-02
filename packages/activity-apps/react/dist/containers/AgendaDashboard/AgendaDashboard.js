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

var _dec, _class, _class2, _temp2;

var _reduxConnect = require('redux-connect');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _format = require('activities/format');

var _format2 = _interopRequireDefault(_format);

var _agenda = require('labels/activities/agenda');

var _agenda2 = _interopRequireDefault(_agenda);

var _activities = require('../../redux/modules/activities');

var activitiesActions = _interopRequireWildcard(_activities);

require('moment/locale/fr');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var formatActivity = (0, _format2.default)({}, _agenda2.default);

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
    lastPage: state.activities.lastPage
  };
}, _extends({}, activitiesActions)), _dec(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(AgendaDashboard, _Component);

  function AgendaDashboard() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, AgendaDashboard);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref2 = AgendaDashboard.__proto__ || Object.getPrototypeOf(AgendaDashboard)).call.apply(_ref2, [this].concat(args))), _this), _this.nextPage = function () {
      var _this$props = _this.props,
          loading = _this$props.loading,
          nextLoading = _this$props.nextLoading,
          activities = _this$props.activities,
          query = _this$props.query,
          nextPage = _this$props.nextPage,
          lastPage = _this$props.lastPage;

      if (!activities || !activities.length || loading || nextLoading || lastPage) return;
      nextPage(query, activities[activities.length - 1].id);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AgendaDashboard, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var lang = this.context.lang;

      _moment2.default.locale(lang);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          activities = _props.activities,
          lastPage = _props.lastPage,
          loading = _props.loading,
          nextLoading = _props.nextLoading;
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
          { className: 'padding-top-md' },
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
          !lastPage && _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'button',
              {
                className: (0, _classnames2.default)('btn', 'btn-default', { disabled: nextLoading || loading }),
                onClick: this.nextPage
              },
              getLabel('next')
            )
          )
        )
      );
    }
  }]);

  return AgendaDashboard;
}(_react2.Component), _class2.propTypes = {
  list: _react2.PropTypes.func,
  nextPage: _react2.PropTypes.func,
  res: _react2.PropTypes.object,
  activities: _react2.PropTypes.array,
  fromId: _react2.PropTypes.number,
  loading: _react2.PropTypes.bool,
  nextLoading: _react2.PropTypes.bool,
  lastPage: _react2.PropTypes.bool
}, _class2.contextTypes = {
  router: _react2.PropTypes.object,
  lang: _react2.PropTypes.string,
  getLabel: _react2.PropTypes.func
}, _temp2)) || _class));

exports.default = AgendaDashboard;
;
module.exports = exports['default'];