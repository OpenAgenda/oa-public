import { Component } from 'react';
import classNames from 'classnames';
import { isArray, isObject } from 'lodash';

export default class FieldCounter extends Component {
  remaining() {
    const { value: propValue, max } = this.props;
    const value = isArray(propValue) && !isObject(propValue[0])
      ? propValue.join('')
      : propValue;

    if (!value) return max;

    return max - value.length;
  }

  render() {
    const remaining = this.remaining();

    return (
      <div
        className={classNames({ 'field-counter': true, error: remaining < 0 })}
      >
        {remaining}
      </div>
    );
  }
}
