"use strict";

import ih from 'immutability-helper';
import React from 'react';

import { connect } from 'react-redux';

import reducers from '../reducers';

import Canvas from './Canvas';

import labels from '@openagenda/labels/agenda-contribute/confirmation';

// container bit
export default connect(
  state => ih( state.confirmation, { lang: { $set: state.config.lang } } ),
  dispatch => ( {
  } )
)( ( { lang } ) => <Canvas lang={lang} step="confirmation">
  <div className="margin-bottom-lg">
    <h3>{labels.moderationRecap[ lang ]}</h3>
    <p>{labels.moderationRecapDetail[ lang ]}</p>
  </div>
  <div>
    <ul className="list-unstyled text-center margin-h-lg">
      <li className="margin-top-md">
        <a className="btn btn-primary btn-block">{labels.seeEventAction[ lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a className="btn btn-default btn-block">{labels.addEventAction[ lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a className="btn btn-default btn-block">{labels.seeAllEventsAction[ lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a className="btn btn-default btn-block">{labels.contactAdministratorsAction[ lang ]}</a>
      </li>
    </ul>
  </div>
</Canvas> );