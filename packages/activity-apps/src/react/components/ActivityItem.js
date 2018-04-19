"use strict";

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import activityFormatMaker from '@openagenda/activities/dist/formatActivity';
import activityLabels from '@openagenda/labels/activities/user';

const formatActivity = activityFormatMaker( {}, activityLabels );

export default class ActivityItem extends Component {

  render() {

    const { activity, lang, withFilterIcons } = this.props;

    const formatArgs = [ activity ];

    if ( lang ) formatArgs.push( lang );

    if ( withFilterIcons ) formatArgs.push( withFilterIcons );

    return <li>
      <span className="activity-info activity-item" dangerouslySetInnerHTML={{ __html: formatActivity.apply( null , formatArgs ) }} />
      <span className="activity-time">
        {moment( activity.createdAt ).format( 'LLL' )}
      </span>
    </li>

  }

}