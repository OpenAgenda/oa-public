import React from 'react';
import { connect } from 'react-redux';

import EventNewForm from '../components/EventNewForm';
import CanvasWithStepper from '../components/CanvasWithStepper';
import Instructions from '../components/Instructions';
import reducers from '../reducers';

import deduceSteps from '../lib/deduceSteps';

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
}) => (
  <CanvasWithStepper
    {...config}
    onDidMount={onDidMount}
    onSelectStep={onSelectStep}
    steps={steps}
    event={event}
  >
    <Instructions
      message={config?.event?.message}
      className="margin-bottom-lg"
    />
    <EventNewForm
      config={config}
      event={event}
      onSuccess={onCreateSuccess}
      memberRole={member.role}
      defaults={defaults}
      onDraftDelete={onDraftDelete}
    />
  </CanvasWithStepper>
));
