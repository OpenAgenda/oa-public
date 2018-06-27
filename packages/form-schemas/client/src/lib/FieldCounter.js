"use strict";

import React, { Component } from 'react';
import classNames from 'classnames';

module.exports = class FieldCounter extends Component {

  remaining() {

    if ( !this.props.value ) return this.props.max;

    return this.props.max - this.props.value.length;

  }

  render() {

    const {
      max,
      value
    } = this.props;

    const remaining = this.remaining();

    return <div className={classNames({ 'field-counter' : true, error: remaining < 0})}>{remaining}</div>

  }

}
