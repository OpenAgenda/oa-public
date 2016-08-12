"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  App: {
    displayName: 'App'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/App.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var React = require('react');

var _require = require('react-redux');

var connect = _require.connect;


var App = _wrapComponent('App')(React.createClass({

  displayName: 'App',

  contextTypes: {
    getLabels: React.PropTypes.func
  },

  render: function render() {
    var getLabels = this.context.getLabels;


    return React.createElement(
      'div',
      { className: 'container user-settings' },
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-md-10 col-md-offset-1' },
          React.createElement(
            'div',
            { className: 'top-margined wsq' },
            React.createElement(
              'div',
              { className: 'content' },
              React.createElement(
                'div',
                { className: 'header' },
                React.createElement(
                  'h2',
                  null,
                  getLabels('accountParameters')
                )
              ),
              this.props.children
            )
          )
        )
      )
    );
  }
}));

function mapStateToProps(_ref) {
  var loading = _ref.app.loading;


  return { loading: loading };
}

module.exports = connect(mapStateToProps)(App);