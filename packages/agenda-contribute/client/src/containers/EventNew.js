import React from 'react';
import { connect } from 'react-redux';

import EventForm from '@openagenda/event-form/build';
import labels from '@openagenda/labels/agenda-contribute/event';

import CanvasWithStepper from '../components/CanvasWithStepper';
import Instructions from '../components/Instructions';
import ButtonSpinner from '../components/ButtonSpinner';
import reducers from '../reducers';

import deduceSteps from '../lib/deduceSteps';
import { eventWithDefaults } from '../lib/URLDefaults';
import eventFormProps from '../lib/eventFormProps';

export default connect(
  state => deduceSteps('event', state),
  dispatch => ({
    onCreateSuccess: (values, response) => dispatch(reducers.event.created(values, response)),
    onDidMount: () => dispatch(reducers.landing.evaluate('event')),
    onSelectStep: step => dispatch(reducers.landing.evaluate(step, true)),
    onDraftDelete: () => dispatch(reducers.event.deleteDraft())
  })
)(({
  config,
  event,
  defaults,
  onCreateSuccess,
  onDidMount,
  onDraftDelete,
  onSelectStep,
  steps,
  member
}) => <CanvasWithStepper
  {...config} 
  onDidMount={onDidMount} 
  onSelectStep={onSelectStep} 
  steps={steps} 
  event={event}>
  <Instructions
    message={config?.event?.message}
    className="margin-bottom-lg"
  />
  <EventForm
    {...eventFormProps({ member, config })}
    includeEventFields
    values={eventWithDefaults(event, defaults)}
    onSubmitSuccess={onCreateSuccess}
    actionComponents={[{
      position: 'bottom',
      Component: ({ onSubmit, loading }) => <div className="wsq padding-all-md">
        {event?.draft && <button 
          className="btn btn-danger btn-block margin-bottom-md"
          disabled={loading} 
          onClick={e => onDraftDelete()} 
        >{labels.deleteDraft[config.lang]}</button>}
        <button
          className="btn btn-default btn-block margin-bottom-md"
          disabled={loading}
          onClick={e => onSubmit(e, { draft: true })}
        >{labels[event?.draft ? 'updateDraft' : 'draft'][config.lang]}</button>
        <button
          className="btn btn-primary btn-block"
          disabled={loading}
          onClick={onSubmit}
        >{labels.create[config.lang]}</button>
        {loading && <ButtonSpinner />}
      </div>
    }]}
  />
</CanvasWithStepper>);
