"use strict";

import React, { Component } from 'react';

export default class Event extends Component {

  constructor( props ) {

    super( props );

    //console.log( props );

  }

  render() {

    return <div>
      <label>{this.props.title}</label>
    </div>

  }

}