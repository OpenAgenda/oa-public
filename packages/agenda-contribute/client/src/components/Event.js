"use strict";

import _ from 'lodash';

import ih from 'immutability-helper';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';

import labels from '@openagenda/labels/agenda-contribute/event';

import Canvas from './Canvas';
import injectConfig from '../lib/injectConfig';
import reducers from '../reducers';

export default connect(
  state => state,
  dispatch => ( {
    onSuccess: ( values, response ) => dispatch( reducers.event.updated( values, response ) )
  } )
)( ( { config, event, onSuccess } ) => <Canvas {...config} step="event">
  <div className="wsq padding-all-md padding-bottom-sm">
    <h3>{labels.title[ config.lang ]}</h3>
  </div>
  {_.get( config, 'event.message' ) ? <div className="padding-all-md padding-bottom-sm wsq event-instruction">
    <ReactMarkdown source={config.event.message} />
  </div>:null}
  <div className="padding-all-md padding-top-lg wsq">
    <EventForm 
      lang={config.lang} 
      values={event}
      onSubmitSuccess={onSuccess}
      actionComponents={[ {
        position: 'bottom',
        Component: ( { onSubmit } ) => <div className="form-group">
          <button onClick={onSubmit} className="btn btn-primary btn-block">{labels.submit[ config.lang ]}</button>
        </div>
      } ]}
    />
  </div>
</Canvas> );