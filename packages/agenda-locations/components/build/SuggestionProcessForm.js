"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _immutabilityHelper = require('immutability-helper');

var _immutabilityHelper2 = _interopRequireDefault(_immutabilityHelper);

var _suggestionProcess = require('@openagenda/labels/agenda-locations/suggestionProcess');

var _suggestionProcess2 = _interopRequireDefault(_suggestionProcess);

var _get = require('@openagenda/utils/get');

var _get2 = _interopRequireDefault(_get);

var _post = require('@openagenda/utils/post');

var _post2 = _interopRequireDefault(_post);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _LocationForm = require('./LocationForm');

var _LocationForm2 = _interopRequireDefault(_LocationForm);

var _suggestionsHelpers = require('./suggestions.helpers.js');

var _suggestionsHelpers2 = _interopRequireDefault(_suggestionsHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_suggestionProcess2.default),
    validates = {
  email: require('@openagenda/validators/email')(),
  phone: require('@openagenda/validators/phone')(),
  text: require('@openagenda/validators/text')()
};

var stakeholderFields = {
  main: 'contactName',
  secondary: ['contactPosition', 'organization', 'contactNumber', 'contactEmail']
};

module.exports = (0, _createReactClass2.default)({

  displayName: 'SuggestionProcessForm',

  propTypes: {

    lang: _propTypes2.default.string.isRequired,

    location: _propTypes2.default.object,

    res: _propTypes2.default.shape({

      getStakeholder: _propTypes2.default.string,
      set: _propTypes2.default.string,
      geocode: _propTypes2.default.string,
      image: _propTypes2.default.object

    }).isRequired,

    // general admin actions ( see actions.js )
    actions: _propTypes2.default.object,

    detailedInfo: _propTypes2.default.bool

  },

  getInitialState: function getInitialState() {

    return {
      isLoading: true,
      loadError: false,
      stakeholder: false,
      suggestionIndex: 0,
      location: this.props.actions.getState().form.location
    };
  },
  getDefaultProps: function getDefaultProps() {

    return {
      suggestionIndex: 0,
      detailedInfo: false,
      settings: {}
    };
  },
  getSetRes: function getSetRes() {

    return this.props.res.set + '?clearSuggestion=' + this.state.suggestionIndex;
  },
  componentWillMount: function componentWillMount() {

    this.loadSuggestion(this.state.suggestionIndex);
  },


  /**
   * get stakeholder for current suggestion
   */
  loadSuggestion: function loadSuggestion() {
    var _this = this;

    var suggestionIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var force = arguments[1];


    if (this.state.loading && !force) return;

    var formState = this.props.actions.getState().form,
        stakeholderId = formState.location.suggestions[this.state.suggestionIndex].stakeholderId,
        res = this.props.res.getStakeholder.replace(':stakeholderId', stakeholderId);

    this.setState({ loading: true });

    (0, _get2.default)(res, function (err, stakeholder) {

      var updatedState = { loading: false };

      if (err) {

        updatedState.loadError = true;
      } else {

        updatedState.stakeholder = stakeholder;

        updatedState.suggestionIndex = suggestionIndex;
      }

      _this.setState(updatedState);
    });
  },
  discardSuggestion: function discardSuggestion(e) {
    var _this2 = this;

    e.preventDefault();

    var stakeholderId = this.props.actions.getState().form.location.suggestions[this.state.suggestionIndex].stakeholderId,
        locationUid = this.props.actions.getState().form.location.uid;

    if (!stakeholderId) {

      log('error', 'discard suggestion: stakholder id was not correctly specified');

      return;
    }

    this.setState({ loading: true });

    (0, _post2.default)(this.props.res.removeSuggestion.replace(':locationUid', locationUid), { stakeholderId: stakeholderId }, function (err, result) {

      if (err) {

        log('error', JSON.stringify(result));

        return _this2.setState({ loading: false });
      }

      if (_this2.state.location.suggestions.length > 1) {

        _this2.props.actions.removeSuggestion(_this2.state.suggestionIndex);

        var newIndex = _this2.state.location.suggestions.length - 1 <= _this2.state.suggestionIndex ? _this2.state.suggestionIndex - 1 : _this2.state.suggestionIndex;

        // annoying little hack to sync component location suggestion with general state..
        _this2.setState({
          location: _this2.props.actions.getState().form.location
        });

        _this2.loadSuggestion(newIndex, true);
      } else {

        _this2.props.actions.closeForm((0, _immutabilityHelper2.default)(_this2.state.location, { suggestions: { $set: [] } }));
      }
    });
  },
  renderStakeholderInfo: function renderStakeholderInfo(info, i) {

    var flattened = typeof info === 'string' ? info : info.label,
        matchingTypes = Object.keys(validates).filter(function (f) {

      try {

        validates[f](flattened);
      } catch (e) {

        return false;
      }

      return true;
    });

    if (!matchingTypes.length) return null;

    switch (matchingTypes[0]) {

      case 'phone':
        return _react2.default.createElement(
          'li',
          { key: i },
          _react2.default.createElement(
            'a',
            { href: 'tel:{info}' },
            flattened
          )
        );

      case 'email':
        return _react2.default.createElement(
          'li',
          { key: i },
          _react2.default.createElement(
            'a',
            { href: 'mailto:{info}' },
            flattened
          )
        );

      case 'text':
        return _react2.default.createElement(
          'li',
          { key: i },
          _react2.default.createElement(
            'span',
            null,
            flattened
          )
        );

    }

    return null;
  },
  navigateStakeholder: function navigateStakeholder(next) {

    if (next && this.state.suggestionIndex >= this.state.location.suggestions.length - 1) {

      return;
    }

    if (!next && this.state.suggestionIndex === 0) {

      return;
    }

    this.loadSuggestion(this.state.suggestionIndex + (next ? +1 : -1));
  },
  onSuccess: function onSuccess(location) {

    if (!location.suggestions.length) {

      this.props.actions.updateEditedLocation(location, true);

      return;
    }

    this.setState({
      location: location
    });

    this.loadSuggestion();
  },
  renderSuggestionPager: function renderSuggestionPager() {

    return this.state.location.suggestions.length > 1 ? _react2.default.createElement(
      'div',
      { className: 'text-center suggestion-nav' },
      _react2.default.createElement(
        'a',
        { className: this.state.suggestionIndex === 0 ? 'disabled' : '', onClick: this.navigateStakeholder.bind(null, false) },
        _react2.default.createElement('i', { className: 'fa fa-arrow-left' })
      ),
      _react2.default.createElement(
        'a',
        { href: '#' },
        this.state.suggestionIndex + 1,
        '/',
        this.state.location.suggestions.length
      ),
      _react2.default.createElement(
        'a',
        { href: '#', className: this.state.suggestionIndex === this.state.location.suggestions.length - 1 ? 'disabled' : '', onClick: this.navigateStakeholder.bind(null, true) },
        _react2.default.createElement('i', { className: 'fa fa-arrow-right' })
      )
    ) : null;
  },
  renderHeader: function renderHeader() {
    var _this3 = this;

    var stakeholderName = null,
        stakeholderInfo = null;

    if (this.state.stakeholder) {

      stakeholderName = this.state.stakeholder[stakeholderFields.main], stakeholderInfo = stakeholderFields.secondary.filter(function (f) {
        return _this3.state.stakeholder[f];
      }).map(function (f) {
        return _this3.state.stakeholder[f];
      });
    }

    return _react2.default.createElement(
      'div',
      { className: 'form-head' },
      _react2.default.createElement(
        'a',
        { onClick: this.props.actions.closeForm },
        getLabel('back', this.props.lang)
      ),
      _react2.default.createElement(
        'h2',
        null,
        getLabel('title', this.props.lang)
      ),
      _react2.default.createElement(
        'span',
        { className: 'info' },
        getLabel('info', this.props.lang)
      ),
      _react2.default.createElement(
        'div',
        { className: 'stakeholder' },
        this.renderSuggestionPager(),
        stakeholderName ? _react2.default.createElement(
          'label',
          null,
          getLabel('suggestionFrom', { stakeholder: stakeholderName }, this.props.lang)
        ) : _react2.default.createElement(
          'label',
          null,
          getLabel('suggestionUnknownFrom', this.props.lang)
        ),
        stakeholderInfo ? _react2.default.createElement(
          'ul',
          null,
          stakeholderInfo.map(this.renderStakeholderInfo)
        ) : _react2.default.createElement('ul', null)
      )
    );
  },
  render: function render() {

    if (this.state.loading) {

      return _react2.default.createElement(_Spinner2.default, null);
    }

    log('displaying suggestion process form');

    var alt = _suggestionsHelpers2.default.prepareAlternatives(this.state.location, this.props, _suggestionProcess2.default, this.state.suggestionIndex);

    // this.state.location has only the fields that have been suggested
    // for change that are set. This conflicts with data validation as
    // validation will attempt to clean all omitted data.

    console.log(alt.location);

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(_LocationForm2.default, {
        Header: this.renderHeader(),
        labels: _suggestionProcess2.default,
        getSetRes: this.getSetRes,
        location: alt.location,
        alternatives: alt.alternatives,
        lang: this.props.lang,
        showToggler: false,
        res: this.props.res,
        cancel: _react2.default.createElement(
          'a',
          { onClick: this.discardSuggestion, href: '#', className: 'text-danger' },
          getLabel('suggestionDiscard', this.props.lang)
        ),
        onSuccess: this.onSuccess,
        settings: this.props.settings,
        detailedInfo: this.props.detailedInfo,
        disableNoAlternatives: true,
        displayLanguageTabs: false
      })
    );
  }
});

function log() {

  console.log.apply(console, arguments);
}
//# sourceMappingURL=SuggestionProcessForm.js.map