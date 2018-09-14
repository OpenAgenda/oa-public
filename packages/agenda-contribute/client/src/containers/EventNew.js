"use strict";

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';
import labels from '@openagenda/labels/agenda-contribute/event';

import Canvas from '../components/Canvas';
import Instructions from '../components/Instructions';
import reducers from '../reducers';

export default connect(
  state => state,
  dispatch => ( {
    onCreateSuccess: ( values, response ) => dispatch( reducers.event.created( values, response ) ),
    onDidMount: () => dispatch( reducers.landing.evaluate( 'event' ) )
  } )
)( ( { config, event, onCreateSuccess, onDidMount } ) => <Canvas {...config} step="event" onDidMount={onDidMount}>
  <div className="wsq padding-h-md padding-v-sm">
    <h3>{labels.title[ config.lang ]}</h3>
  </div>
  <Instructions message={_.get( config, 'event.message' )} className="wsq padding-top-sm" />
  <div className="padding-all-md padding-top-lg wsq">
    <EventForm 
      fileStore={config.fileStore}
      locationRes={config.locationRes}
      lang={config.lang} 
      values={event}
      onSubmitSuccess={onCreateSuccess}
      actionComponents={[ {
        position: 'bottom',
        Component: ( { onSubmit } ) => <div className="form-group">
          <button onClick={onSubmit} className="btn btn-primary btn-block">{labels.create[ config.lang ]}</button>
        </div>
      } ]}
    />
  </div>
</Canvas> );
