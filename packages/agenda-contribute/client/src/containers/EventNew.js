"use strict";

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';
import labels from '@openagenda/labels/agenda-contribute/event';

import Canvas from '../components/Canvas';
import Instructions from '../components/Instructions';
import reducers from '../reducers';

import deduceSteps from '../lib/deduceSteps';

export default connect(
  state => deduceSteps( 'event', state ),
  dispatch => ( {
    onCreateSuccess: ( values, response ) => dispatch( reducers.event.created( values, response ) ),
    onDidMount: () => dispatch( reducers.landing.evaluate( 'event' ) ),
    onSelectStep: step => dispatch( reducers.landing.evaluate( step, true ) )
  } )
)( ( { config, event, onCreateSuccess, onDidMount, onSelectStep, steps } ) => <Canvas {...config} onDidMount={onDidMount} onSelectStep={onSelectStep} steps={steps} event={event}>
  
  <Instructions message={_.get( config, 'event.message' )} className="margin-bottom-lg" />
  
  <EventForm 
    withErrors={false}
    fileStore={config.fileStore}
    locationRes={config.locationRes}
    lang={config.lang} 
    values={event}
    onSubmitSuccess={onCreateSuccess}
    classNames={{
      fieldsCanvas: 'padding-all-md wsq padding-bottom-sm',
      bottomErrorsCanvas: 'error-summary padding-all-md',
    }}
    actionComponents={[ {
      position: 'bottom',
      Component: ( { onSubmit } ) => <div className="wsq padding-all-md">
        <button onClick={ e => onSubmit( e, { draft: true } )} className="btn btn-default btn-block margin-bottom-md">{labels[ _.get( event, 'draft' ) ? 'updateDraft' : 'draft' ][ config.lang ]}</button>
        <button onClick={onSubmit} className="btn btn-primary btn-block">{labels.create[ config.lang ]}</button>
      </div>
    } ]}
  />
  
</Canvas> );
