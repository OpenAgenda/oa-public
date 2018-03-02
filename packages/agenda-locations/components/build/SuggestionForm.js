"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _suggestion = require('@openagenda/labels/agenda-locations/suggestion');

var _suggestion2 = _interopRequireDefault(_suggestion);

var _form = require('@openagenda/labels/agenda-locations/form');

var _form2 = _interopRequireDefault(_form);

var _get = require('@openagenda/utils/get');

var _get2 = _interopRequireDefault(_get);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _LocationForm = require('./LocationForm');

var _LocationForm2 = _interopRequireDefault(_LocationForm);

var _suggestions = require('./suggestions.helpers');

var _suggestions2 = _interopRequireDefault(_suggestions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_utils2.default.extend({}, _form2.default, _suggestion2.default));

/**
 * Suggestion form preloads a location form for a stakeholder
 * for him to suggest and submit changes to an agenda moderator
 *
 * propTypes include the stakeholder Id, the form then loads the location
 * with the relevent suggestion if already existing.
 *
 * It then proceeds to preload the suggestions in the location form
 */
module.exports = (0, _createReactClass2.default)({

  displayName: 'SuggestionForm',

  propTypes: {

    lang: _propTypes2.default.string.isRequired,

    locationUid: _propTypes2.default.number,

    res: _propTypes2.default.shape({
      getSuggestion: _propTypes2.default.string,
      setSuggestion: _propTypes2.default.string,
      reverseGeocode: _propTypes2.default.string,
      geocode: _propTypes2.default.string,
      image: _propTypes2.default.shape({
        upload: _propTypes2.default.string,
        remove: _propTypes2.default.string
      })
    }).isRequired,

    redirects: _propTypes2.default.shape({
      cancel: _propTypes2.default.string.isRequired,
      success: _propTypes2.default.string.isRequired
    }).isRequired

  },

  getInitialState: function getInitialState() {

    return {
      loading: true,
      loadError: false,
      location: false,
      settings: false,
      completed: false
    };
  },
  componentWillMount: function componentWillMount() {
    var _this = this;

    log('componentWillMount');

    (0, _get2.default)(this.props.res.getSuggestion.replace(':locationUid', this.props.locationUid), function (err, result) {

      if (err) {

        return _this.setState({ loadError: true });
      }

      _this.setState({
        loading: false,
        location: result.location,
        settings: result.settings
      });
    });
  },
  onCancel: function onCancel() {

    window.location.href = this.props.redirects.cancel;
  },
  renderHeader: function renderHeader() {

    if (this.state.location.suggestions && this.state.location.suggestions.length) {

      return _react2.default.createElement(
        'div',
        { className: 'form-head' },
        _react2.default.createElement(
          'a',
          { onClick: this.onCancel },
          getLabel('back', this.props.lang)
        ),
        _react2.default.createElement(
          'h2',
          null,
          getLabel('suggestionEditTitle', this.props.lang)
        ),
        _react2.default.createElement(
          'span',
          { className: 'info' },
          getLabel('suggestionEditInfo', this.props.lang)
        )
      );
    } else {

      return _react2.default.createElement(
        'div',
        { className: 'form-head' },
        _react2.default.createElement(
          'a',
          { onClick: this.onCancel },
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
        )
      );
    }
  },
  showComplete: function showComplete() {

    this.setState({
      completed: true
    });
  },
  renderCompleted: function renderCompleted() {

    return _react2.default.createElement(
      'div',
      { className: 'page-dialog' },
      _react2.default.createElement(
        'div',
        { className: 'content jumbotron text-center' },
        _react2.default.createElement(
          'p',
          null,
          getLabel('completeTitle', this.props.lang)
        )
      ),
      _react2.default.createElement(
        'p',
        { className: 'content' },
        getLabel('completeText', this.props.lang)
      ),
      _react2.default.createElement(
        'div',
        { className: 'content actions text-center' },
        _react2.default.createElement(
          'a',
          { onClick: this.closeForm, className: 'btn btn-primary' },
          getLabel('completeLink', this.props.lang)
        )
      )
    );
  },
  closeForm: function closeForm() {

    window.location.href = this.props.redirects.success;
  },
  render: function render() {

    if (this.state.loading) {

      return _react2.default.createElement(_Spinner2.default, null);
    }

    if (this.state.loadError) {

      return _react2.default.createElement(
        'p',
        null,
        _suggestion2.default.loadError[this.props.lang]
      );
    }

    if (this.state.completed) {

      return this.renderCompleted();
    }

    var alt = _suggestions2.default.prepareAlternatives(this.state.location, this.props, _suggestion2.default);

    return _react2.default.createElement(_LocationForm2.default, {
      Header: this.renderHeader(),
      lang: this.props.lang,
      labels: _suggestion2.default,
      location: alt.location,
      alternatives: alt.alternatives,
      res: {
        set: this.props.res.setSuggestion.replace(':locationUid', this.props.locationUid),
        image: {
          upload: this.props.res.image.upload.replace(':locationUid', this.props.locationUid),
          remove: this.props.res.image.remove.replace(':locationUid', this.props.locationUid)
        },
        reverseGeocode: this.props.res.reverseGeocode,
        geocode: this.props.res.geocode
      },
      hideCurrentAlternative: true,
      disableAutoTranslation: true,
      detailedInfo: this.state.settings.eventForm && this.state.settings.eventForm.detailed,
      settings: this.state.settings,
      onCancel: this.onCancel,
      onSuccess: this.showComplete
    });
  }
});

function log() {

  console.log.apply(console, arguments);
}
//# sourceMappingURL=SuggestionForm.js.map