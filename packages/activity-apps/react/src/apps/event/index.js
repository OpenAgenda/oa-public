"use strict";

import React from 'react';

import 'moment/locale/fr';

import { ActivityItem } from '../../components';

export default function ( options ) {

  const { lang, activities } = Object.assign( {
    activities: [],
    lang: 'fr'
  }, options );

  return (
    <div>
      {(activities && activities.length > 0) && <ul className="list-unstyled activity-list">
        {activities.map( a => <ActivityItem activity={a} lang={lang} /> )}
      </ul>}
    </div>
  );

}
