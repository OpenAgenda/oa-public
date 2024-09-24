'use strict';

const React = require('react');
const createReactClass = require('create-react-class');
const PropTypes = require('prop-types');
const getLabel = require('../lib/makeLabelGetter')(require('../labels'));

module.exports = createReactClass({
  displayName: 'InputField',

  propTypes: {
    // value - usually a string
    lang: PropTypes.string,

    // the name of the input
    name: PropTypes.string,

    // used by component to load labels
    getLabel: PropTypes.func,

    // called when value changes
    onChange: PropTypes.func,

    // optional validator
    validator: PropTypes.func,

    // optional placeholder
    placeholder: PropTypes.string,

    // type of input ( textarea or text )
    type: PropTypes.string,

    // optional button
    renderButton: PropTypes.func,

    // optional autofocus
    autoFocus: PropTypes.bool,

    enabled: PropTypes.bool,
  },

  getInitialState() {
    return {
      userHasTyped: false,
    };
  },

  getDefaultProps() {
    return {
      type: 'text',

      autoFocus: false,

      enabled: true,
    };
  },

  onChange(e) {
    if (!this.props.enabled) {
      return;
    }

    this.setState({
      userHasTyped: true,
    });

    this.props.onChange(this.props.name, e.target.value);
  },

  getLabel(label, values) {
    let str;

    if (this.props.getLabel) {
      str = this.props.getLabel(label, values, this.props.lang);
    }

    return str || getLabel(label, values, this.props.lang);
  },

  renderErrors() {
    const self = this;

    if (!this.props.validator) return null;

    if (
      (!this.props.value || !this.props.value.length) &&
      !this.state.userHasTyped
    )
      return null;

    try {
      this.props.validator(this.props.value);
    } catch (errors) {
      return (
        <p>
          {errors.map((error) => (
            <span key={error.code} className="error">
              {self.getLabel(error.code, error.values, self.props.lang)}
            </span>
          ))}
        </p>
      );
    }

    return null;
  },

  render() {
    let className = this.props.enabled ? 'form-group' : 'form-group disabled';

    if (this.props.groupClassName) className += ` ${this.props.groupClassName}`;

    return (
      <div className={className}>
        <label>{this.getLabel(this.props.name)}</label>
        {this.props.info && this.getLabel(this.props.info) ? (
          <div>{this.getLabel(this.props.info)}</div>
        ) : null}
        <div className={this.props.className || ''}>
          {this.props.type !== 'textarea' ? (
            <input
              className="form-control"
              type="text"
              placeholder={this.getLabel(this.props.placeholder)}
              value={this.props.value}
              onChange={this.onChange}
              disabled={!this.props.enabled}
              autoFocus={!!this.props.autoFocus}
            />
          ) : (
            <textarea
              className="form-control"
              value={this.props.value}
              rows={6}
              disabled={!this.props.enabled}
              onChange={this.onChange}
              autoFocus={!!this.props.autoFocus}
            />
          )}{' '}
          {this.props.renderButton ? this.props.renderButton() : ''}
        </div>
        {this.renderErrors()}
        {this.props.bottom ? this.props.bottom : null}
      </div>
    );
  },
});
