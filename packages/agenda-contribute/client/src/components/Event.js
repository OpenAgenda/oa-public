"use strict";

import ih from 'immutability-helper';
import React from 'react';

import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';

import labels from '@openagenda/labels/agenda-contribute/event';

import Canvas from './Canvas';
import injectConfig from '../lib/injectConfig';
import reducers from '../reducers';

import marked from 'marked';


export default connect(
  state => state,
  dispatch => ( {
  } )
)( ( { config, event } ) => <Canvas {...config} step="event">
  <div className="wsq padding-all-md padding-bottom-sm">
    <h3>{labels.title[ config.lang ]}</h3>
  </div>
  {config.event.instruction?<div className="padding-all-md wsq event-instruction">
  {marked(config.event.instruction)}
  </div>:null}
  <div className="padding-all-md padding-top-lg wsq">
    <EventForm 
      lang={config.lang} 
      values={event}
    />
  </div>
</Canvas> );