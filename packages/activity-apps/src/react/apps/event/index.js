"use strict";

import React from 'react';
import labels from '@openagenda/labels/activities/event';
import { ActivityItem } from '../../components';

import 'moment/locale/fr';


export default function ( options ) {

  const { lang, activities } = Object.assign( {
    activities: [],
    lang: 'fr'
  }, options );

  return (
    <div>
      {(activities && activities.length > 0) && <ul className="list-unstyled activity-list">
        {activities.map( a => <ActivityItem key={'activity.' + a.id} activity={a} labels={labels} lang={lang} /> )}
      </ul>}
    </div>
  );

}
