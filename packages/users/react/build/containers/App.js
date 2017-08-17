"use strict";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    _require = require('react-redux'),
    connect = _require.connect;

var App = createReactClass({

  displayName: 'App',

  contextTypes: {
    getLabels: PropTypes.func
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
});

function mapStateToProps(_ref) {
  var loading = _ref.app.loading;


  return { loading: loading };
}

module.exports = connect(mapStateToProps)(App);
//# sourceMappingURL=App.js.map