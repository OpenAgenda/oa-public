"use strict";

import React, { Component } from 'react';

export default class More extends Component {

  render() {

    return <div className="calendar-more-item">
      <label>{this.props.title}</label>
    </div>

  }

}