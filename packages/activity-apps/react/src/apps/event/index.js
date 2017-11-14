"use strict";

import React from 'react';
import moment from 'moment';
// import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/event';
import activityFormatMaker from '@openagenda/activities/formatActivity';

import 'moment/locale/fr';

// const getLabel = ( label, values = {} ) => makeGetterLabel( labels )( label, values, lang );
const formatActivity = activityFormatMaker( {}, labels );

export default function ( options ) {

  const { lang, activities } = Object.assign( {
    activities: [],
    lang: 'fr'
  }, options );

  return (
    <div>
      {(activities && activities.length > 0) && <ul className="list-unstyled">
        {activities.map( activity => (
          <li key={activity.id} className="padding-bottom-xs">
            <label className="pull-left margin-right-sm small">
              {moment( activity.createdAt ).locale( lang ).format( 'LLL' )}
            </label>
            <p className="activity-item" dangerouslySetInnerHTML={{ __html: formatActivity( activity, lang ) }} />
          </li>
        ) )}
      </ul>}
    </div>
  );

}
