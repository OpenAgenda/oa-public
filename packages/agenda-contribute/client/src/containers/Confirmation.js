"use strict";

import _ from 'lodash';
import { connect } from 'react-redux';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import labels from '@openagenda/labels/agenda-contribute/confirmation';

import Canvas from '../components/Canvas';
import Instructions from '../components/Instructions';
import deduceSteps from '../lib/deduceSteps';
import reducers from '../reducers';

const defaultConfirmationMessages = [
  labels.moderationRecapDetail,
  labels.readyToPublishRecapDetail,
  labels.publishedRecapDetail
];

// container bit
export default connect(
  state => deduceSteps( 'confirmation', state ),
  dispatch => ( {
    onRedirectAction: type => e => dispatch( reducers.confirmation.redirect( type ) ),
    onDidMount: step => dispatch( reducers.landing.evaluate( step ) )
  } )
)( ( { config, onRedirectAction, onDidMount, steps, event } ) => <Canvas {...config} step="confirmation" onDidMount={onDidMount} onSelectStep={()=>{}} steps={steps} title={labels.moderationRecap[ config.lang ]}>

  { _.get( config, 'confirmation.message' )
    ? <Instructions message={_.get( config, 'confirmation.message' )} className="margin-bottom-lg" />
    : <div className="padding-h-md padding-top-lg padding-bottom-xs wsq">
        <p className="text-center margin-bottom-xs margin-top-sm">{defaultConfirmationMessages[ _.get( config, 'confirmation.state', 2 ) ][ config.lang ]}</p>
      </div>
  }
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
