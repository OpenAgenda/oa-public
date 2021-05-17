import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';

const log = debug('InputField');

class InputField extends Component {
  static propTypes = {
    lang: PropTypes.string,
    name: PropTypes.string,
    getLabel: PropTypes.func,
    onChange: PropTypes.func,
    validator: PropTypes.func,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    renderButton: PropTypes.func,
    autoFocus: PropTypes.bool,
    enabled: PropTypes.bool,
    groupClassName: PropTypes.string,
    ClassName: PropTypes.string,
    value: PropTypes.string,
    info: PropTypes.string
  };

  static defaultProps = {
    type: 'text',
    autoFocus: false,
    enabled: true
  };

  constructor(props) {
    super(props);
    this.state = {
      userHasTyped: false,
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const { enabled, name, onChange } = this.props;

    if (!enabled) return;

    this.setState({
      userHasTyped: true
    });
    onChange(name, e.target.value);
  }

  getLabel(label, values) {
    const { lang, getLabel } = this.props;

    if (getLabel) {
      return getLabel(label, values, lang);
    }
    return null;
  }

  renderErrors() {
    const { validator, value, lang } = this.props;
    const { userHasTyped } = this.state;

    if (!validator) return null;

    if ((!value || !value.length) && !userHasTyped) return null;

    try {
      validator(value);
    } catch (errors) {
      return (
        <p>{ errors.map(error => (
          <span
            key={error.code}
            className="error"
          >
            {this.getLabel(error.code, error.values, lang)}
          </span>
        )) }
        </p>
      );
    }
    return null;
  }

  render() {
    const {
      enabled, groupClassName, name, info, placeholder, value, autoFocus, renderButton, bottom, type, className: propsClassName
    } = this.props;
    let className = enabled ? 'form-group' : 'form-group disabled';

    if (groupClassName) className += ` ${groupClassName}`;

    return (
      <div className={className}>
        <label>{this.getLabel(name)}</label>
        { info && this.getLabel(info)
          ? <div>{this.getLabel(info)}</div>
          : null }
        <div className={propsClassName || ''}>
          {type !== 'textarea' ? (
            <input
              className="form-control"
              type="text"
              placeholder={this.getLabel(placeholder)}
              value={value}
              onChange={this.onChange}
              disabled={!enabled}
              autoFocus={!!autoFocus} 
            />
          ) : (
            <textarea
              className="form-control"
              value={value}
              rows={6}
              disabled={!enabled}
              onChange={this.onChange}
              autoFocus={!!autoFocus}
            />
          ) }
          {renderButton ? renderButton() : ''}
        </div>
        {this.renderErrors()}
        {bottom ? bottom : null }
      </div>
    );
  }
}

export default InputField;
