"use strict";

import ih from 'immutability-helper';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { connect } from 'react-redux';

import reducers from '../reducers';

import Canvas from './Canvas';

import labels from '@openagenda/labels/agenda-contribute/confirmation';

// container bit
export default connect(
  state => state,
  dispatch => ( {
  } )
)( ( { config } ) => <Canvas {...config} step="confirmation">
  
  <div className="wsq padding-all-md padding-top-sm text-center">
    <h3>{labels.moderationRecap[ config.lang ]}</h3>
  </div>
  {_.get( config, 'confirmation.message' ) ? <div className="padding-all-md padding-bottom-sm wsq event-instruction">
    <ReactMarkdown source={config.confirmation.message} />
  </div> : <div className="padding-h-md padding-bottom-sm wsq">
    <p>{labels.moderationRecapDetail[ config.lang ]}</p> 
  </div> }
  <div className="padding-all-md padding-top-sm wsq">
    <ul className="list-unstyled text-center margin-h-lg">
      <li className="margin-top-md">
        <a className="btn btn-primary btn-block">{labels.seeEventAction[ config.lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a className="btn btn-default btn-block">{labels.addEventAction[ config.lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a className="btn btn-default btn-block">{labels.seeAllEventsAction[ config.lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a className="btn btn-default btn-block">{labels.contactAdministratorsAction[ config.lang ]}</a>
      </li>
    </ul>
  </div>
  
</Canvas> );