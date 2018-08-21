"use strict";

import _ from 'lodash';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';
import labels from '@openagenda/labels/agenda-contribute/event';

import Canvas from '../components/Canvas';
import reducers from '../reducers';

export default connect(
  state => state,
  dispatch => ( {
    onCreateSuccess: ( values, response ) => dispatch( reducers.event.created( values, response ) ),
    onDidMount: () => dispatch( reducers.landing.evaluate( 'event' ) )
  } )
)( ( { config, event, onCreateSuccess, onDidMount } ) => <Canvas {...config} step="event" onDidMount={onDidMount}>
  <div className="wsq padding-all-md padding-bottom-sm">
    <h3>{labels.title[ config.lang ]}</h3>
  </div>
  {_.get( config, 'event.message' ) ? <div className="padding-all-md padding-bottom-sm wsq event-instruction">
    <ReactMarkdown source={config.event.message} />
  </div>:null}
  <div className="padding-all-md padding-top-lg wsq">
    <EventForm 
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
