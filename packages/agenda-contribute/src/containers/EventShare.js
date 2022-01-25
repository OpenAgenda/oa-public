import debug from 'debug';
import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Canvas from '../components/Canvas';
import EventEditForm from '../components/EventEditForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EventWasSuccessfullyShared from '../components/EventWasSuccessfullyShared';
import EventIsAlreadyInTarget from '../components/EventIsAlreadyInTarget';
import ShowFullEventForm from '../components/ShowFullEventForm';
import useEvent from '../hooks/useEvent';
import useDetailedAgenda from '../hooks/useDetailedAgenda';
import useEventFormConfig from '../hooks/useEventFormConfig';
import useAgendaContext from '../hooks/useAgendaContext';
import utils from '../lib/utils';
import getStandardFieldErrors from '../lib/getStandardFieldErrors';

import contributeReducer from '../reducers/contribute';

const {
  schemaWithoutEventFields,
  shouldTriggerImmediateShare,
  shouldShowFullEventFormLink,
  shouldDisplayEventFields,
  filterEventData
} = utils;

const messages = defineMessages({
  share: {
    id: 'AgendaContribute.EventShare.share',
    defaultMessage: 'Add the event'
  }
});

const log = debug('EventShare');

export default function EventShare({ agenda, history }) {
  const m = useIntl().formatMessage;
  const location = useLocation();
  const apiRoot = useSelector(state => state.settings.apiRoot);
  const sharedEvent = useSelector(state => state.contribute.sharedEvent);
  const requestedDisplayEventFields = useSelector(state => state.contribute.requestedDisplayEventFieldsInShare);

  const [reloadedForm, setReloadedForm] = useState(false);

  const dispatch = useDispatch();

  const res = useSelector(state => state.res);

  const {
    eventUid,
    fromAgendaUid
  } = useParams();

  const {
    eventIsLoading,
    event,
    eventContext
  } = useEvent(fromAgendaUid, eventUid);

  const {
    eventIsLoading: eventInTargetIsLoading,
    event: eventInTarget,
  } = useEvent(agenda.uid, eventUid);

  const {
    detailedAgendaIsLoading: fromAgendaIsLoading,
    detailedAgenda: fromAgenda
  } = useDetailedAgenda(fromAgendaUid);

  const {
    detailedAgendaIsLoading,
    detailedAgenda
  } = useDetailedAgenda(agenda.uid);

  const {
    agendaContextIsLoading,
    agendaContext,
  } = useAgendaContext(agenda.uid);

  const {
    config,
    configIsLoading,
    schema
  } = useEventFormConfig(agenda);

  useEffect(() => {
    if (reloadedForm || !requestedDisplayEventFields) {
      return;
    }
    if (requestedDisplayEventFields) {
      setReloadedForm(true);
    }
  }, [requestedDisplayEventFields, reloadedForm, setReloadedForm]);

  if (eventIsLoading || fromAgendaIsLoading || configIsLoading || agendaContextIsLoading || detailedAgendaIsLoading || eventInTargetIsLoading) {
    return <Loading />;
  }

  if (eventInTarget) {
    return (
      <EventIsAlreadyInTarget
        history={history}
        location={location}
        event={event}
        agenda={agenda}
        fromAgenda={fromAgenda}
      />
    );
  }

  if (sharedEvent) {
    log('share successful');
    return (
      <EventWasSuccessfullyShared
        history={history}
        location={location}
        event={sharedEvent}
        fromAgenda={fromAgenda}
        agenda={agenda}
      />
    );
  }

  const errors = getStandardFieldErrors(detailedAgenda, event, eventContext);

  const shareRes = `${apiRoot}${location.pathname}`;

  if (shouldTriggerImmediateShare({ schema, agendaContext })) {
    dispatch(contributeReducer.launchImmediateEventShare(shareRes));
    return <Loading />;
  }

  if (requestedDisplayEventFields && !reloadedForm) {
    // force form reload when decision to display event fields is made
    log('reloading form to display all event data');
    return <Loading />;
  }

  const displayEventFields = shouldDisplayEventFields({ schema, eventContext, requestedDisplayEventFields });

  const canEditEvent = eventContext?.me?.authorizations?.canEditEvent;

  return (
    <Canvas
      mode="share"
      event={event}
      fromAgenda={fromAgenda}
      agenda={agenda}
    >
      {errors.length ? (
        <ErrorMessage
          canEditEvent={canEditEvent}
          event={event}
          agenda={detailedAgenda}
          onCancel={() => {
            dispatch(contributeReducer.goBackOrToEvent({ agenda: fromAgenda, event }));
          }}
          errors={errors}
          suggestChangeRes={
            res.suggestChangeRes
              .replace(':agendaSlug', fromAgenda.slug)
              .replace(':eventSlug', event.slug)
          }
        />
      ) : null}
      {shouldShowFullEventFormLink({ schema, eventContext, requestedDisplayEventFields }) ? (
        <ShowFullEventForm
          onShowFullEvent={() => {
            dispatch(contributeReducer.displayEventFieldsInShare());
          }}
        />
      ) : null}
      {canEditEvent || !errors.length ? (
        <EventEditForm
          res={shareRes}
          config={{
            ...config,
            schema: displayEventFields ? schema : schemaWithoutEventFields(schema)
          }}
          memberRole={agendaContext.me.member.role}
          event={filterEventData({
            event,
            canChangeState: agendaContext?.me?.authorizations?.canChangeState,
            canEditEvent: eventContext?.me?.authorizations?.canEditEvent,
            schema,
            displayEventFields
          })}
          onSuccess={(_event, response) => {
            dispatch(contributeReducer.displayShareSuccess(response.body.event));
          }}
          saveButtonLabel={m(messages.share)}
        />
      ) : null}
    </Canvas>
  );
}
