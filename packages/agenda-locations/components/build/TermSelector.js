"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {

    // interface language
    lang: _propTypes2.default.string,

    // currently selected term
    //value: PropTypes.obj,

    // field from which to extract terms
    // for more than one field, comma-separate.
    field: _propTypes2.default.string.isRequired,

    // ressource to fetch terms
    res: _propTypes2.default.string,

    // callback to go to when change is made
    onChange: _propTypes2.default.func

  },

  getDefaultProps: function getDefaultProps() {

    return {
      lang: 'en'
    };
  },

  getInitialState: function getInitialState() {

    return {
      terms: []
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {

    if (this.props.field == nextProps.field) return;

    this.setState({ terms: [] });
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {

    if (this.props.field == prevProps.field) return;

    this.fetchTerms();
  },

  componentDidMount: function componentDidMount() {

    this.fetchTerms();
  },

  fetchTerms: function fetchTerms() {

    var self = this;

    (0, _xhr2.default)({
      json: true,
      uri: this.props.res + '?field=' + this.props.field
    }, function (err, result) {

      if (err) return;

      var firstTerm = self.props.field.split(',')[0],
          sortedTerms = result.body.terms.sort(function (a, b) {

        if (a[firstTerm] > b[firstTerm]) {

          return 1;
        }

        if (a[firstTerm] < b[firstTerm]) {

          return -1;
        }

        // a must be equal to b
        return 0;
      });

      self.setState({
        terms: sortedTerms
      });
    });
  },

  onChange: function onChange(index) {

    this.props.onChange(this.state.terms[index]);
  },

  getTermIndex: function getTermIndex(value) {

    if (!value) return null;

    return this.state.terms.findIndex(function (t) {

      var found = false;

      for (var k in t) {

        if (!['country', 'countryCode'].includes(k) && (typeof value === 'string' ? value : value[k]) === t[k]) {

          found = true;
        }
      }

      return found;
    });
  },

  termOption: function termOption(term, index) {

    var option = {
      value: index,
      label: ''
    },
        labelParts = [],
        self = this;

    this.props.field.split(',').forEach(function (field) {

      // country is specific as it is multilingual
      if (field == 'country') {

        labelParts.push(term.country[self.props.lang]);
      } else {

        labelParts.push(term[field]);
      }
    });

    option.label = labelParts.join(', ');

    return option;
  },

  render: function render() {
    var _this = this;

    var self = this;

    return _react2.default.createElement(
      'div',
      { className: 'terms-selector' },
      _react2.default.createElement(_reactSelect2.default, {
        value: this.getTermIndex(this.props.value) || this.props.value,
        placeholder: this.props.placeholder || null,
        options: this.state.terms.map(function (t, i) {
          return self.termOption(t, i);
        }),
        onChange: function onChange(value) {
          return _this.onChange(value ? value.value : value);
        },
        clearable: true })
    );
  }

});
//# sourceMappingURL=TermSelector.js.map