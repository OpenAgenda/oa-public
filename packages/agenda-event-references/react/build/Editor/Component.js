"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _EventItem = require('../components/EventItem');

var _EventItem2 = _interopRequireDefault(_EventItem);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _SearchField = require('react-form-components/build/SearchField');

var _SearchField2 = _interopRequireDefault(_SearchField);

var _clickTracker = require('../clickTracker');

var _clickTracker2 = _interopRequireDefault(_clickTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Editor = function Editor(props) {
  return _react2.default.createElement(EditorComponent, props);
};

Editor.propTypes = {
  search: _propTypes2.default.object,
  onSearchType: _propTypes2.default.func,
  onShow: _propTypes2.default.func
};

var EditorComponent = (0, _createReactClass2.default)({
  componentDidMount: function componentDidMount() {

    _clickTracker2.default.switchOn('search');
  },
  componentDidUpdate: function componentDidUpdate() {

    _clickTracker2.default.switchOn('search');
  },
  render: function render() {
    var _props = this.props,
        onShow = _props.onShow,
        onSearch = _props.onSearch,
        onEventRemove = _props.onEventRemove,
        onEventAdd = _props.onEventAdd,
        search = _props.search,
        events = _props.events,
        loading = _props.loading,
        getLabel = _props.getLabel;


    return _react2.default.createElement(
      'div',
      { className: 'event-references' },
      _react2.default.createElement(
        'div',
        { className: 'configure' },
        _react2.default.createElement(
          'h2',
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
          { className: search.events ? 'search dropdown open' : 'search dropdown' },
          _react2.default.createElement(_SearchField2.default, {
            loading: search.searching,
            threshold: 3,
            value: search.query,
            name: 'search',
            label: getLabel('search'),
            placeholder: getLabel('search'),
            onChange: onSearch
          }),
          search.events ? _react2.default.createElement(
            'ul',
            { className: 'dropdown-menu' },
            search.events.length ? search.events.map(function (event) {
              return _react2.default.createElement(
                'li',
                { key: event.uid },
                _react2.default.createElement(_EventItem2.default, { event: event, onClick: onEventAdd })
              );
            }) : _react2.default.createElement(
              'li',
              { className: 'empty' },
              _react2.default.createElement(
                'p',
                null,
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