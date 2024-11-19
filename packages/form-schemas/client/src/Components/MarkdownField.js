import ih from 'immutability-helper';
import { Component } from 'react';
import { fromMarkdownToHTML, fromHTMLToMarkdown } from '@openagenda/md';

import SlateField from './SlateField.js';
import HTMLSerializer from './HTMLSerializer.js';
import { fromBRToP, fromPToBR } from './breaksAndParagraphs.js';

export default class MarkdownField extends Component {
  shouldComponentUpdate(nextProps, _nextState) {
    const { value } = this.props;

    return value !== nextProps.value;
  }

  onChange(value) {
    const { onChange } = this.props;

    onChange(fromHTMLToMarkdown(fromPToBR(HTMLSerializer.serialize(value))));
  }

  render() {
    const {
      value,
      field: { default: defaultValue },
    } = this.props;

    const appliedValue = value === null && defaultValue ? defaultValue : value;

    return (
      <SlateField
        {...ih(this.props, {
          value: {
            $set: HTMLSerializer.deserialize(
              fromBRToP(fromMarkdownToHTML(appliedValue)),
            ),
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
