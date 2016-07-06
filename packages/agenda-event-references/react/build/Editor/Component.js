"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _EventItem = require('../components/EventItem');

var _EventItem2 = _interopRequireDefault(_EventItem);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _SearchField = require('react-form-components/build/SearchField');

var _SearchField2 = _interopRequireDefault(_SearchField);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _clickTracker = require('../clickTracker');

var _clickTracker2 = _interopRequireDefault(_clickTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Editor = function Editor(props) {
  return _react2.default.createElement(EditorComponent, props);
};

Editor.propTypes = {
  search: _react.PropTypes.object,
  onSearchType: _react.PropTypes.func,
  onShow: _react.PropTypes.func
};

var EditorComponent = _react2.default.createClass({
  displayName: 'EditorComponent',
  componentDidMount: function componentDidMount() {

    _clickTracker2.default.switchOn('search');
  },
  componentDidUpdate: function componentDidUpdate() {

    _clickTracker2.default.switchOn('search');
  },
  render: function render() {
    var _props = this.props;
    var onShow = _props.onShow;
    var onSearch = _props.onSearch;
    var onEventRemove = _props.onEventRemove;
    var onEventAdd = _props.onEventAdd;
    var search = _props.search;
    var events = _props.events;
    var loading = _props.loading;
    var getLabel = _props.getLabel;


    return _react2.default.createElement(
      'div',
      { className: 'event-references' },
      _react2.default.createElement(
        'div',
        { className: 'configure' },
        _react2.default.createElement(
          'label',
          null,
          getLabel('editorTitle')
        ),
        _react2.default.createElement(
          'ul',
          { className: 'list-unstyled references' },
          loading ? _react2.default.createElement(_Spinner2.default, null) : events.length ? events.map(function (e) {
            return _react2.default.createElement(
              'li',
              { key: e.uid },
              _react2.default.createElement(_EventItem2.default, { event: e, onRemove: onEventRemove })
            );
          }) : _react2.default.createElement(
            'li',
            null,
            _react2.default.createElement(
              'span',
              { className: 'empty' },
              getLabel('emptyReferences')
            )
          )
        ),
        search.display ? _react2.default.createElement(
          'div',
          { className: 'search' },
          _react2.default.createElement(_SearchField2.default, {
            loading: search.searching,
            value: search.query,
            name: 'search',
            label: getLabel('search'),
            placeholder: getLabel('search'),
            onChange: onSearch
          }),
          search.events ? _react2.default.createElement(
            'ul',
            { className: 'search-results' },
            search.events.length ? search.events.map(function (event) {
              return _react2.default.createElement(
                'li',
                { key: event.uid },
                _react2.default.createElement(_EventItem2.default, { event: event, onClick: onEventAdd })
              );
            }) : _react2.default.createElement(
              'li',
              null,
              _react2.default.createElement(
                'p',
                { className: 'empty-search' },
                getLabel('emptySearch')
              )
            )
          ) : null
        ) : _react2.default.createElement(
          'a',
          { onClick: onShow },
          getLabel('addEvent')
        )
      )
    );
  }
});

exports.default = Editor;
module.exports = exports['default'];