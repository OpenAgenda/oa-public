"use strict";

import ih from 'immutability-helper';

import React, { Component } from 'react';

import SlateField from './SlateField';

import HTMLSerializer from './HTMLSerializer';
import Turndown from 'turndown';
import marked from 'marked';

const turndownService = new Turndown();

module.exports = class MarkdownField extends Component {

  onChange( value ) {

    this.props.onChange( turndownService.turndown( HTMLSerializer.serialize( value ) ) );

  }

  render() {

    return <SlateField {...ih( this.props, {
      value: {
        $set: HTMLSerializer.deserialize( marked( this.props.value || '' ) )
      },
      onChange: {
        $set: this.onChange.bind( this )
      },
      raw: {
        $set: true
      }
    } ) }/>

  }

}