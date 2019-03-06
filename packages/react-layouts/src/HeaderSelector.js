import React, { Component } from 'react';
import Context from './contexts/header';
import { setType } from './headerReducer';

export default class HeaderSelector extends Component {
  static contextType = Context;

  constructor( props, context ) {
    super( props );

    const state = context.getState();

    if ( props.type !== state.type ) {
      context.dispatch( setType( props.type ) );
    }
  }

  render() {
    return null;
  }
}
