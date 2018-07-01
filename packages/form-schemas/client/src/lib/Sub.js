"use strict";

import React, { Component } from 'react';
import classNames from 'classnames';

module.exports = class Sub extends Component {

  render() {

    const {
      error,
      label
    } = this.props;

    return <div className={classNames({
      sub : true, 
      error: !!error 
    })}>{error || label}</div>

  }

}
