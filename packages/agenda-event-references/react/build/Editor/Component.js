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

var _SearchField = require('@openagenda/react-form-components/build/SearchField');

var _SearchField2 = _interopRequireDefault(_SearchField);

var _Spinner = require('@openagenda/react-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _clickTracker = require('../clickTracker');

var _clickTracker2 = _interopRequireDefault(_clickTracker);

var _EventItem = require('../components/EventItem');

var _EventItem2 = _interopRequireDefault(_EventItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = {
  get: require('lodash/get')
};

var Editor = function Editor(props) {
  return _react2.default.createElement(EditorComponent, props);
};

Editor.propTypes = {
  search: _propTypes2.default.object,
  onSearchType: _propTypes2.default.func,
  onShow: _propTypes2.default.func
};

var EditorComponent = (0, _createReactClass2.default)({
  displayName: 'EditorComponent',
  componentDidMount: function componentDidMount() {

    _clickTracker2.default.switchOn('search');
  },
  componentDidUpdate: function componentDidUpdate() {

    _clickTracker2.default.switchOn('search');
  },
  renderDropdownItem: function renderDropdownItem(event) {
    var onEventAdd = this.props.onEventAdd;


    return _react2.default.createElement(
      'li',
      { key: event.uid },
      _react2.default.createElement(_EventItem2.default, { event: event, onClick: onEventAdd })
    );
  },
  renderDropdown: function renderDropdown(search) {
    var _this = this;

    var getLabel = this.props.getLabel;

    // the drop down renders when

    if (search.searching) {

      return _react2.default.createElement(
        'ul',
        { className: 'dropdown-menu' },
        _react2.default.createElement(
          'li',
          null,
          _react2.default.createElement(
            'div',
            { className: 'padding-all-lg' },
            _react2.default.createElement(_Spinner2.default, null)
          )
        )
      );
    }

    if (search.events !== null && search.events.length) {

      return _react2.default.createElement(
        'ul',
        { className: 'dropdown-menu' },
        _react2.default.createElement(
          'li',
          { key: 'event-section-item' },
          _react2.default.createElement(
            'div',
            { className: 'media section-item' },
            _react2.default.createElement(
              'strong',
              { className: 'text-muted' },
              getLabel('searchResultTitle')
            )
          )
        ),
        search.events.map(function (event) {
          return _this.renderDropdownItem(event);
        })
      );
    }

    if (search.suggestions !== null && search.suggestions.length) {

      return _react2.default.createElement(
        'ul',
        { className: 'dropdown-menu' },
        _react2.default.createElement(
          'li',
          { key: 'suggestion-section-item' },
          _react2.default.createElement(
            'div',
            { className: 'media section-item' },
            _react2.default.createElement(
              'strong',
              { className: 'text-muted' },
              getLabel('suggestionResultTitle')
            )
          )
        ),
        search.suggestions.map(function (event) {
          return _this.renderDropdownItem(event);
        })
      );
    }

    return _react2.default.createElement(
      'ul',
      { className: 'dropdown-menu' },
      _react2.default.createElement(
        'li',
        { className: 'empty' },
        _react2.default.createElement(
          'p',
          null,
          getLabel('emptySearch')
        )
      )
    );
  },
  render: function render() {
    var _props = this.props,
        onShow = _props.onShow,
        onSearch = _props.onSearch,
        onSearchFocus = _props.onSearchFocus,
        onEventRemove = _props.onEventRemove,
        onEventAdd = _props.onEventAdd,
        onSuggestionsAdd = _props.onSuggestionsAdd,
        search = _props.search,
        events = _props.events,
        loading = _props.loading,
        getLabel = _props.getLabel,
        info = _props.info,
        suggest = _props.suggest,
        loadingSuggestions = _props.loadingSuggestions;


    var disabledAddSuggestions = loadingSuggestions || search.suggestions && !search.suggestions.length;

    var displayDropdown = search.query && search.query.length || suggest && search.suggestions !== null && search.suggestions.length;

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
        info ? _react2.default.createElement(
          'div',
          { className: 'margin-bottom-sm' },
          info
        ) : null,
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
          { className: displayDropdown ? 'search dropdown open' : 'search dropdown' },
          _react2.default.createElement(_SearchField2.default, {
            loading: search.searching,
            threshold: 3,
            value: search.query,
            name: 'search',
            label: getLabel('search'),
            placeholder: getLabel('search'),
            onFocus: onSearchFocus,
            onChange: onSearch
          }),
          displayDropdown ? this.renderDropdown(search) : null
        ) : _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'a',
            { className: 'btn btn-primary margin-right-sm', onClick: onShow },
            getLabel('addEvent')
          ),
          suggest ? _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'span',
              { className: 'margin-h-sm' },
              getLabel('addEventOr')
            ),
            _react2.default.createElement(
              'a',
              {
                disabled: disabledAddSuggestions,
                className: disabledAddSuggestions ? 'btn margin-right-sm text-muted' : 'btn margin-right-sm',
                onClick: onSuggestionsAdd },
              getLabel('addEventSuggest')
            )
          ) : null,
          loadingSuggestions ? _react2.default.createElement(_Spinner2.default, { mode: 'inline' }) : null
        )
      )
    );
  }
});

exports.default = Editor;
module.exports = exports['default'];