"use strict";

import React, { Component } from 'react';
import moment from 'moment';

import 'moment/locale/fr';

import activityFormatMaker from '@openagenda/activities/dist/formatActivity';
import activityLabels from '@openagenda/labels/activities/user';

const formatActivity = activityFormatMaker( {}, activityLabels );

export default class ActivityItem extends Component {

  render() {

    const { activity, lang, withFilterIcons, onActivityClick } = this.props;

    const formatArgs = [ activity ];

    if ( lang ) formatArgs.push( lang );

    if ( withFilterIcons ) formatArgs.push( withFilterIcons );

    return <li>
      <span
        className="activity-info activity-item"
        dangerouslySetInnerHTML={{ __html: formatActivity.apply( null , formatArgs ) }}
        onClick={onActivityClick || null}
      />
      <span className="activity-time">
        {moment( activity.createdAt ).locale( lang ).format( 'LLL' )}
      </span>
    </li>

  }

}
