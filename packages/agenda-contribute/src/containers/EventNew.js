import debug from 'debug';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CanvasWithStepper from '../components/CanvasWithStepper';
import ClosedMessage from '../components/ClosedMessage';
import EventNewForm from '../components/EventNewForm';
import Loading from '../components/Loading';
import Instructions from '../components/Instructions';

import steps from '../lib/steps';
import utils from '../lib/utils';
import useEventFormConfig from '../hooks/useEventFormConfig';
import usePrefix from '../hooks/usePrefix';

import contributeReducer from '../reducers/contribute';

const {
  isContributionType
} = utils;

const log = debug('EventNew');

export default function EventNew({ agenda, history }) {
  log('loading');

  const dispatch = useDispatch();
  const prefix = usePrefix(agenda);
  const {
    config,
    isLoading,
    agendaContext
  } = useEventFormConfig(agenda);
  const apiRoot = useSelector(state => state.settings.apiRoot);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('event')}
      onSelectStep={step => history.push(`${prefix}/${step}`)}
    >
      {isContributionType(agenda, 'CLOSED') ? <ClosedMessage memberRole={agendaContext.me.member.role} className="margin-bottom-md" /> : null}
      <Instructions
        message={agenda?.settings?.contribution?.messages?.instructions}
        className="margin-bottom-lg"
      />
      <EventNewForm
        res={`${apiRoot}${prefix}`}
        history={history}
        config={config}
        onSuccess={(event, response) => {
          dispatch(contributeReducer.eventCreateSuccess({
            agenda,
            response
          }));
        }}
        memberRole={agendaContext.me.member.role}
        onDraftDelete={() => {}}
      />
    </CanvasWithStepper>
  );
}
