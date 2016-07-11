"use strict";

var React = require('react'),
    Spinner = require('./Spinner');

module.exports = React.createClass({

  displayName: 'SearchField',

  propTypes: {
    value: React.PropTypes.string,
    threshold: React.PropTypes.number,
    name: React.PropTypes.string,
    dynamic: React.PropTypes.bool,
    timeout: React.PropTypes.number,
    loading: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {

    return {
      value: '',
      name: 'search',
      dynamic: false,
      timeout: 1500,
      loading: false,
      threshold: 2
    };
  },

  getInitialState: function getInitialState() {

    return {
      value: this.props.value,
      edit: this.props.value
    };
  },

  componentDidUpdate: function componentDidUpdate() {

    if (this.props.value !== this.state.value) {

      this.setState({
        value: this.props.value,
        edit: this.props.value
      });
    }
  },

  clearTimeout: function (_clearTimeout) {
    function clearTimeout() {
      return _clearTimeout.apply(this, arguments);
    }

    clearTimeout.toString = function () {
      return _clearTimeout.toString();
    };

    return clearTimeout;
  }(function () {

    if (this.timeout) {

      clearTimeout(this.timeout);

      this.timeout = undefined;
    }
  }),

  onChange: function onChange(e) {

    var self = this;

    this.setState({
      edit: e.target.value.length ? e.target.value : undefined
    });

    this.clearTimeout();

    // if the length of the search string is below the
    // threshold, ignore change
    if (e.target.value.length < this.props.threshold) {

      return;
    }

    this.timeout = setTimeout(function () {

      self.props.onChange(self.props.name, self.state.edit);

      self.setState({
        value: self.state.edit
      });

      self.timeout = undefined;
    }, this.props.timeout);
  },

  onCommit: function onCommit(e) {

    e.preventDefault();

    if (typeof e.keyCode == 'undefined' || e.keyCode == 13) {

      this.clearTimeout();

      this.props.onChange(this.props.name, this.state.edit);

      this.setState({
        value: this.state.edit
      });
    }
  },

  isLoading: function isLoading() {

    return !!(this.props.loading || this.timeout);
  },

  renderSpinner: function renderSpinner() {

    return React.createElement(
      'div',
      { className: 'input-spinner' },
      React.createElement(Spinner, {
        loading: this.isLoading(),
        spinner: {
          width: 1,
          length: 3,
          radius: 4,
          color: '#666'
        } })
    );
  },

  renderButton: function renderButton() {

    return React.createElement(
      'span',
      { className: 'input-group-btn' },
      React.createElement(
        'button',
        {
          className: 'btn btn-default',
          type: 'button',
          onClick: this.onCommit },
        this.props.loading ? this.renderSpinner() : React.createElement('i', { className: 'fa fa-search' })
      )
    );
  },

  render: function render() {

    return React.createElement(
      'div',
      { className: this.props.dynamic ? 'search-field' : 'search-field input-group' },
      React.createElement(
        'label',
        { className: 'sr-only', htmlFor: this.props.name },
        this.props.label
      ),
      React.createElement('input', {
        placeholder: this.props.placeholder,
        type: 'text',
        className: 'form-control',
        onChange: this.onChange,
        onKeyUp: this.onCommit,
        value: this.state.edit || '' }),
      this.props.dynamic ? this.renderSpinner() : this.renderButton()
    );
  }

});