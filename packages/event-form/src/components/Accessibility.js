import _ from 'lodash';
import React, { Component } from 'react';

import mLabels from '@openagenda/labels/event/accessibility';
import flatten from '@openagenda/labels/flatten';

const TYPES = ['hi', 'vi', 'pi', 'mi', 'ii'];

const getDefault = () => TYPES.reduce((c, t) => ({
  ...c,
  [t]: false
}), {});

module.exports = class AccessibilityComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      enabled: this.hasAccessibility()
    };
  }

  hasAccessibility() {
    const {
      value: currentValue
    } = this.props;
    const value = currentValue ?? getDefault();

    return !!_.keys(value).filter(k => value[k]).length;
  }

  toggleEnabled() {
    const {
      onChange
    } = this.props;

    const {
      enabled
    } = this.state;

    const toggled = !enabled;

    this.setState({
      enabled: toggled
    });

    if (!toggled && this.hasAccessibility()) {
      onChange(getDefault());
    }
  }

  toggleAccessibility(type) {
    const {
      onChange,
      value: currentValue
    } = this.props;

    const value = currentValue ?? getDefault();

    onChange({
      ...value,
      [type]: !value[type]
    });
  }

  render() {
    const {
      value,
      lang
    } = this.props;

    const labels = flatten(mLabels, lang, true);

    const {
      enabled
    } = this.state;

    return (
      <div className="accessibility form-group">
        <div className="checkbox">
          <label htmlFor="show-accessibility">
            <input
              id="show-accessibility"
              type="checkbox"
              checked={enabled}
              onChange={this.toggleEnabled.bind(this)}
            />
            {labels.input}
          </label>
        </div>
        {enabled ? (
          <div className="accessibility-detail margin-left-md margin-top-md">{
            TYPES.map((type, i) => (
              <div
                className={`checkbox ${type + (i + 1 < TYPES.length ? ' margin-bottom-md' : ' margin-bottom-xs')}`}
                key={type}
              >
                <label htmlFor={type}>
                  <input
                    id={type}
                    name={type}
                    type="checkbox"
                    checked={!!value?.[type]}
                    onChange={this.toggleAccessibility.bind(this, type)}
                  />
                  <i />{labels[type]}
                </label>
              </div>
            ))
          }
          </div>
        ) : null}
      </div>
    );
  }
};
