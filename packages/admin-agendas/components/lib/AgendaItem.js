"use strict";

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _components = {
  AgendaItem: {
    displayName: 'AgendaItem'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'components/src/AgendaItem.jsx',
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

module.exports = _wrapComponent('AgendaItem')(React.createClass({

  displayName: 'AgendaItem',

  propTypes: {
    agenda: React.PropTypes.object,
    onSelect: React.PropTypes.func
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: 'agenda-item media cursor-pointer', onClick: this.props.onSelect.bind(null, this.props.agenda.id, 1) },
      React.createElement(
        'a',
        null,
        React.createElement(
          'div',
          { className: 'media-body' },
          React.createElement(
            'h4',
            { className: 'title media-heading' },
            this.props.agenda.title
          )
        )
      )
    );
  }

}));