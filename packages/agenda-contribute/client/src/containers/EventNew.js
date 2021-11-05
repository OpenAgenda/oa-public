import React from 'react';

import { useSelector } from 'react-redux';

import CanvasWithStepper from '../components/CanvasWithStepper';
import ClosedMessage from '../components/ClosedMessage';
import EventNewForm from '../components/EventNewForm';
import Loading from '../components/Loading';
import Instructions from '../components/Instructions';

import steps from '../lib/steps';
import useEventFormConfig from '../lib/useEventFormConfig';
import useMember from '../lib/useMember';

import utils from '../lib/utils';

const {
  isContributionType
} = utils;

export default function EventNew({ agenda, history }) {
  const {
    memberIsLoading,
    member
  } = useMember(agenda);

  const prefix = useSelector(state => state.prefix);

  const { config, configIsLoading } = useEventFormConfig(agenda);

  if (configIsLoading || memberIsLoading) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('event')}
      onSelectStep={step => history.push(`${prefix}/${step}`)}
    >
      {isContributionType(agenda, 'CLOSED') ? <ClosedMessage memberRole={member.role} /> : null}
      <Instructions
        message={agenda?.settings?.contribution?.messages?.instructions}
        className="margin-bottom-lg"
      />
      <EventNewForm
        config={config}
        onSuccess={() => {}}
        memberRole={member.role}
        onDraftDelete={() => {}}
      />
    </CanvasWithStepper>
  );
}
