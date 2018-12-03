import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';
import Spinner from '@openagenda/react-components/build/Spinner';
import labels from '@openagenda/labels/agenda-contribute/event';

import Canvas from '../components/Canvas';
import Instructions from '../components/Instructions';
import ButtonSpinner from '../components/ButtonSpinner';
import reducers from '../reducers';

import deduceSteps from '../lib/deduceSteps';

export default connect(
  state => deduceSteps( 'event', state ),
  dispatch => ( {
    onCreateSuccess: ( values, response ) => dispatch( reducers.event.created( values, response ) ),
    onDidMount: () => dispatch( reducers.landing.evaluate( 'event' ) ),
    onSelectStep: step => dispatch( reducers.landing.evaluate( step, true ) ),
    onDraftDelete: () => dispatch( reducers.event.deleteDraft() )
  } )
)( ( { config, event, onCreateSuccess, onDidMount, onDraftDelete, onSelectStep, steps } ) => <Canvas {...config} onDidMount={onDidMount} onSelectStep={onSelectStep} steps={steps} event={event}>

  <Instructions message={_.get( config, 'event.message' )} className="margin-bottom-lg" />

  <EventForm
    withErrors={false}
    schemaExtensions={config.schemaExtensions}
    fileStore={config.fileStore}
    locationRes={config.locationRes}
    referencesRes={config.referencesRes}
    lang={config.lang}
    values={event}
    onSubmitSuccess={onCreateSuccess}
    classNames={{
      fieldsCanvas: 'padding-all-md wsq padding-bottom-sm',
      bottomErrorsCanvas: 'error-summary padding-all-md',
    }}
    actionComponents={[ {
      position: 'bottom',
      Component: ( { onSubmit, loading } ) => <div className="wsq padding-all-md">
        { _.get( event, 'draft' ) ? <button disabled={loading} onClick={ e => onDraftDelete() } className="btn btn-danger btn-block margin-bottom-md">{labels.deleteDraft[ config.lang ]}</button> : null }
        <button disabled={loading} onClick={ e => onSubmit( e, { draft: true } )} className="btn btn-default btn-block margin-bottom-md">{labels[ _.get( event, 'draft' ) ? 'updateDraft' : 'draft' ][ config.lang ]}</button>
        <button disabled={loading} onClick={onSubmit} className="btn btn-primary btn-block">{labels.create[ config.lang ]}</button>
        { loading && <ButtonSpinner /> }
      </div>
    } ]}
  />

</Canvas> );
