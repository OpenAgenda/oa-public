"use strict";

import React, { Component } from 'react';
import More from './More';

export default class Event extends Component {

  constructor( props ) {

    super( props );

    //console.log( props );

  }

  render() {

    if ( this.props.event.type === 'more' ) return <More {...this.props} />;

    return <div className="calendar-event-item">
      <label>{this.props.title}</label>
    </div>

  }

}