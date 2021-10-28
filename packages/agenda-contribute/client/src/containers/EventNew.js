import React from 'react';

import CanvasWithStepper from '../components/CanvasWithStepper';
import EventNewForm from '../components/EventNewForm';
import Instructions from '../components/Instructions';

import steps from '../lib/steps';

export default function EventNew(props) {
  const {
    agenda
  } = props;

  const eventFormProps = useSelector(state => _.pick(state, [
    'files',
    'res'
  ]));


  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('event')}
    >
      <Instructions
        message={agenda?.settings?.contribution?.messages?.instructions}
        className="margin-bottom-lg"
      />
      <EventNewForm
        {...eventFormProps}
        config={config}
        onSuccess={onCreateSuccess}
        memberRole={member.role}
        defaults={defaults}
        onDraftDelete={onDraftDelete}
      />
    </CanvasWithStepper>
  );
}

/* export default connect(
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
)); */
