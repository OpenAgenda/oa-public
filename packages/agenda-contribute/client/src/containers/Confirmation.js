"use strict";


import _ from 'lodash';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { connect } from 'react-redux';

import reducers from '../reducers';

import Canvas from '../components/Canvas';

import labels from '@openagenda/labels/agenda-contribute/confirmation';

import deduceSteps from '../lib/deduceSteps';

// container bit
export default connect(
  state => deduceSteps( 'confirmation', state ),
  dispatch => ( {
    onRedirectAction: type => e => dispatch( reducers.confirmation.redirect( type ) ),
    onDidMount: step => dispatch( reducers.landing.evaluate( step ) )
  } )
)( ( { config, onRedirectAction, onDidMount, steps } ) => <Canvas {...config} step="confirmation" onDidMount={onDidMount} onSelectStep={()=>{}} steps={steps}>
  
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
        <a onClick={onRedirectAction( 'seeEvent' )} className="btn btn-primary btn-block">{labels.seeEventAction[ config.lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a onClick={onRedirectAction( 'createOtherEvent' )} className="btn btn-default btn-block">{labels.addEventAction[ config.lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a onClick={onRedirectAction( 'seeAllEvents' )} className="btn btn-default btn-block">{labels.seeAllEventsAction[ config.lang ]}</a>
      </li>
      <li className="margin-top-md">
        <a onClick={onRedirectAction( 'contactAdministrators' )} className="btn btn-default btn-block">{labels.contactAdministratorsAction[ config.lang ]}</a>
      </li>
    </ul>
  </div>
  
</Canvas> );
