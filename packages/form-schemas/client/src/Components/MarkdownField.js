import ih from 'immutability-helper';
import { Component } from 'react';

import markdown from '../iso/markdown';
import SlateField from './SlateField';
import HTMLSerializer from './HTMLSerializer';

export default class MarkdownField extends Component {
  shouldComponentUpdate(nextProps, _nextState) {
    const {
      value,
    } = this.props;

    return value !== nextProps.value;
  }

  onChange(value) {
    const {
      onChange,
    } = this.props;

    onChange(markdown.to(HTMLSerializer.serialize(value)));
  }

  render() {
    const {
      value,
      field: {
        default: defaultValue,
      },
    } = this.props;

    const appliedValue = (value === null) && defaultValue ? defaultValue : value;

    return (
      <SlateField
        {...ih(this.props, {
          value: {
            $set: HTMLSerializer.deserialize(markdown.from(appliedValue)),
          },
          onChange: {
            $set: this.onChange.bind(this),
          },
          raw: {
            $set: true,
          },
        })}
        parentValue={appliedValue}
      />
    );
  }
}
