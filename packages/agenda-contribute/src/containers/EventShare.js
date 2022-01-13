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
import ShowFullEventForm from '../components/ShowFullEventForm';
import useEvent from '../hooks/useEvent';
import useDetailedAgenda from '../hooks/useDetailedAgenda';
import useEventFormConfig from '../hooks/useEventFormConfig';
import useAgendaContext from '../hooks/useAgendaContext';
import utils from '../lib/utils';
import getUneditableStandardFieldErrors from '../lib/getUneditableStandardFieldErrors';

import contributeReducer from '../reducers/contribute';

const {
  schemaWithoutEventFields,
  shouldTriggerImmediateShare,
  shouldShowFullEventFormLink,
  shouldDisplayEventFields
} = utils;

const messages = defineMessages({
  share: {
    id: 'AgendaContribute.EventShare.share',
    defaultMessage: 'Add the event'
  }
});

const log = debug('EventShare');

export default function EventShare({ agenda }) {
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

  if (eventIsLoading || fromAgendaIsLoading || configIsLoading || agendaContextIsLoading || detailedAgendaIsLoading) {
    return <Loading />;
  }

  if (sharedEvent) {
    log('share successful');
    return (
      <EventWasSuccessfullyShared
        event={sharedEvent}
        fromAgenda={fromAgenda}
        agenda={agenda}
      />
    );
  }

  const errors = getUneditableStandardFieldErrors(detailedAgenda, event, eventContext);

  const shareRes = `${apiRoot}${location.pathname}`;

  if (shouldTriggerImmediateShare({ schema, agendaContext })) {
    dispatch(contributeReducer.launchImmediateEventShare(shareRes));
    return <Loading />;
  }

  if (requestedDisplayEventFields && !reloadedForm) {
    // force form reload when decision to display event fields is made
    return <Loading />;
  }

  return (
    <Canvas
      mode="share"
      event={event}
      fromAgenda={fromAgenda}
      agenda={agenda}
    >
      {shouldShowFullEventFormLink({ schema, eventContext, requestedDisplayEventFields }) ? (
        <ShowFullEventForm
          onShowFullEvent={() => {
            dispatch(contributeReducer.displayEventFieldsInShare());
          }}
        />
      ) : null}
      {errors.length ? (
        <ErrorMessage
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
      ) : (
        <EventEditForm
          res={shareRes}
          config={{
            ...config,
            schema: shouldDisplayEventFields({ schema, eventContext, requestedDisplayEventFields }) ? schema : schemaWithoutEventFields(schema)
          }}
          memberRole={agendaContext.me.member.role}
          event={event}
          onSuccess={(_event, response) => {
            dispatch(contributeReducer.eventShareSuccess({
              fromAgenda,
              agenda,
              response
            }));
          }}
          saveButtonLabel={m(messages.share)}
        />
      )}
    </Canvas>
  );
}
