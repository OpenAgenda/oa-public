import ih from 'immutability-helper';
import React, { Component } from 'react';
import SlateField from './SlateField';
import HTMLSerializer from './HTMLSerializer';

export default class HTMLField extends Component {
  shouldComponentUpdate(nextProps) {
    const {
      value
    } = this.props;
    return value !== nextProps.value;
  }

  onChange(value) {
    const {
      onChange
    } = this.props;
    onChange(HTMLSerializer.serialize(value));
  }

  render() {
    const {
      value
    } = this.props;

    return (
      <SlateField {...ih(this.props, {
        value: {
          $set: HTMLSerializer.deserialize(value)
        },
        onChange: {
          $set: v => this.onChange(v)
        },
        raw: {
          $set: true
        }
      })}
      />
    );
  }
}
