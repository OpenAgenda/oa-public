import ih from 'immutability-helper';

import React, { Component } from 'react';

import SlateField from './SlateField';

import HTMLSerializer from './HTMLSerializer';

import markdown from '../iso/markdown';

module.exports = class MarkdownField extends Component {

  onChange(value) {
    this.props.onChange(markdown.to(HTMLSerializer.serialize(value)));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.value !== nextProps.value;
  }

  render() {
    return <SlateField { ...ih( this.props, {
      value: {
        $set: HTMLSerializer.deserialize(markdown.from(this.props.value))
      },
      onChange: {
        $set: this.onChange.bind(this)
      },
      raw: {
        $set: true
      }
    }) }/>
  }

}
