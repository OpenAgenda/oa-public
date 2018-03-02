"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _selector = require('@openagenda/labels/agenda-locations/selector');

var _selector2 = _interopRequireDefault(_selector);

var _create = require('@openagenda/labels/agenda-locations/create');

var _create2 = _interopRequireDefault(_create);

var _LocationForm = require('./LocationForm');

var _LocationForm2 = _interopRequireDefault(_LocationForm);

var _LocationSearch = require('./LocationSearch');

var _LocationSearch2 = _interopRequireDefault(_LocationSearch);

var _CreateFormHeader = require('./CreateFormHeader');

var _CreateFormHeader2 = _interopRequireDefault(_CreateFormHeader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {

    lang: _propTypes2.default.string,

    location: _propTypes2.default.object,

    // agenda-specific settings for selector
    settings: _propTypes2.default.object,

    /**
     * mode of the selector needs to be handled by
     * the parent component as in the event form use case,
     * the component is displayed at 2 different locations depending
     * on the mode. Create replaces the form, search is embedded in it;
     */
    mode: _propTypes2.default.string,

    onChangeMode: _propTypes2.default.func,

    disableChange: _propTypes2.default.bool,

    onChange: _propTypes2.default.func // if location has changed, returns it;
  },

  getDefaultProps: function getDefaultProps() {

    return {
      mode: 'create',
      settings: {
        eventForm: {
          detailed: false
        }
      },
      disableChange: false
    };
  },

  getInitialState: function getInitialState() {

    return {
      name: ''
    };
  },

  getLabel: function getLabel(name, values) {

    var str = _selector2.default[name][this.props.lang],
        k;

    if (values) {

      for (k in values) {

        str = str.replace(k, values[k]);
      }
    }

    return str;
  },

  getMode: function getMode() {

    return this.props.mode || 'show';
  },

  onSelect: function onSelect(l) {

    this.props.onChange(l, 'show');
  },

  onCreateRequest: function onCreateRequest(value) {

    this.props.onChangeMode('create', { name: value });
  },

  onCreateSuccess: function onCreateSuccess(l) {

    this.props.onChange(l, 'show');
  },

  switchToSearch: function switchToSearch() {

    this.props.onChangeMode('search');
  },

  renderSelected: function renderSelected() {

    var l = this.props.location;

    return _react2.default.createElement(
      'div',
      { className: 'selected-location' },
      !this.props.disableChange ? _react2.default.createElement(
        'div',
        { className: 'actions' },
        _react2.default.createElement(
          'a',
          {
            onClick: this.switchToSearch,
            className: 'btn btn-default' },
          this.getLabel(l ? 'change' : 'find')
        )
      ) : null,
      l ? _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'name' },
          l.name
        ),
        _react2.default.createElement(
          'div',
          { className: 'address' },
          l.address
        )
      ) : _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'p',
          { className: 'nolocation' },
          this.getLabel('nolocation')
        )
      )
    );
  },
  renderSearch: function renderSearch() {

    return _react2.default.createElement(_LocationSearch2.default, {
      init: this.props.location ? this.props.location.name : '',
      getLabel: this.getLabel,
      res: this.props.res,
      lang: this.props.lang,
      onSelect: this.onSelect,
      onCreateRequest: this.onCreateRequest });
  },

  renderHeader: function renderHeader() {

    return _react2.default.createElement(_CreateFormHeader2.default, {
      settings: this.props.settings,
      lang: this.props.lang
    });
  },


  renderCreateForm: function renderCreateForm() {

    return _react2.default.createElement(_LocationForm2.default, {
      Header: this.renderHeader(),
      settings: this.props.settings,
      detailedInfo: this.props.settings.eventForm && this.props.settings.eventForm.detailed,
      res: this.props.res,
      lang: this.props.lang,
      onCancel: this.switchToSearch,
      onSuccess: this.onCreateSuccess,
      labels: _create2.default,
      location: this.props.location });
  },

  render: function render() {

    var self = this;

    return _react2.default.createElement(
      'div',
      { className: 'location-selector' },
      function () {

        switch (self.getMode()) {
          case 'show':
            return self.renderSelected();
          case 'search':
            return self.renderSearch();
          case 'create':
            return self.renderCreateForm();
        }
      }()
    );
  }

});
//# sourceMappingURL=LocationSelector.js.map