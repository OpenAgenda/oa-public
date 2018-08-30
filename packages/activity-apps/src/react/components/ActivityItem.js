"use strict";

import React, { Component } from 'react';
import moment from 'moment';
import activityFormatMaker from '@openagenda/activities/dist/formatActivity';

import 'moment/locale/fr';


export default class ActivityItem extends Component {

  constructor( props ) {
    super( props );
    this.formatActivity = activityFormatMaker( {}, props.labels ).bind( this );
  }

  render() {

    const { activity, lang, withFilterIcons, onActivityClick } = this.props;

    const formatArgs = [ activity ];

    if ( lang ) formatArgs.push( lang );

    if ( withFilterIcons ) formatArgs.push( withFilterIcons );

    return <li>
      <span
        className="activity-info activity-item"
        dangerouslySetInnerHTML={{ __html: this.formatActivity( ...formatArgs ) }}
        onClick={onActivityClick || null}
      />
      <span className="activity-time">
        {moment( activity.createdAt ).locale( lang ).format( 'LLL' )}
      </span>
    </li>

  }

}
