import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import CanvasWithStepper from '../components/CanvasWithStepper';
import ClosedMessage from '../components/ClosedMessage';
import EventNewForm from '../components/EventNewForm';
import Loading from '../components/Loading';
import useEvent from '../hooks/useEvent';
import Instructions from '../components/Instructions';

import steps from '../lib/steps';
import utils from '../lib/utils';
import useEventFormConfig from '../hooks/useEventFormConfig';
import useAgendaContext from '../hooks/useAgendaContext';
import usePrefix from '../hooks/usePrefix';

import contributeReducer from '../reducers/contribute';

const {
  isContributionType
} = utils;

export default function EventDraft({ agenda, history }) {
  const location = useLocation();

  const {
    eventUid // as a string
  } = useParams();

  const {
    agendaContextIsLoading,
    agendaContext
  } = useAgendaContext(agenda.uid);

  const {
    eventIsLoading,
    event
  } = useEvent(agenda.uid, eventUid);

  const dispatch = useDispatch();
  const prefix = usePrefix(agenda);
  const { config, configIsLoading } = useEventFormConfig(agenda);
  const apiRoot = useSelector(state => state.settings.apiRoot);

  if (configIsLoading || agendaContextIsLoading || eventIsLoading) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('event', { agenda })}
      onSelectStep={step => history.push(`${prefix}/${step}`)}
    >
      {isContributionType(agenda, 'CLOSED') ? <ClosedMessage memberRole={agendaContext.me.member.role} className="margin-bottom-md" /> : null}
      <Instructions
        message={agenda?.settings?.contribution?.messages?.instructions}
        className="margin-bottom-lg"
      />
      <EventNewForm
        res={`${apiRoot}${location.pathname}`}
        history={history}
        event={event}
        config={config}
        onSuccess={(_event, response) => {
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
