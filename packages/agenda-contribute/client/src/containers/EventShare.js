import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Canvas from '../components/Canvas';
import EventEditForm from '../components/EventEditForm';
import Loading from '../components/Loading';
import useEvent from '../hooks/useEvent';
import useDetailedAgenda from '../hooks/useDetailedAgenda';
import useEventFormConfig from '../hooks/useEventFormConfig';
import useEventContext from '../hooks/useEventContext';
import useMember from '../hooks/useMember';
import utils from '../lib/utils';

import contributeReducer from '../reducers/contribute';

const {
  removeEventFieldsFromSchema
} = utils;

const messages = defineMessages({
  confirmShare: {
    id: 'AgendaContribute.EventShare.share',
    defaultMessage: 'Add the event'
  }
});

export default function EventAdd({
  agenda,
  history
}) {
  const m = useIntl().formatMessage;
  const APIRoot = useSelector(state => state.APIRoot);
  const dispatch = useDispatch();

  const {
    eventUid,
    fromAgendaUid
  } = useParams();

  const {
    eventIsLoading,
    event
  } = useEvent(fromAgendaUid, eventUid);

  const {
    memberIsLoading,
    member
  } = useMember(agenda);

  const {
    detailedAgendaIsLoading,
    detailedAgenda: fromAgenda
  } = useDetailedAgenda(fromAgendaUid);

  const {
    eventContextIsLoading,
    eventContext
  } = useEventContext(agenda.uid, eventUid);

  const {
    config,
    configIsLoading,
    schema
  } = useEventFormConfig(agenda);

  if (eventIsLoading || detailedAgendaIsLoading || configIsLoading || memberIsLoading || eventContextIsLoading) {
    return <Loading />;
  }

  return (
    <Canvas
      mode="share"
      event={event}
      fromAgenda={fromAgenda}
      agenda={agenda}
    >
      <EventEditForm
        res={`${APIRoot}${history.location.pathname}`}
        config={{
          ...config,
          schema: eventContext.me?.authorizations?.canEditEvent ? schema : removeEventFieldsFromSchema(schema)
        }}
        memberRole={member.role}
        event={event}
        onSuccess={(_event, response) => {
          dispatch(contributeReducer.eventShareSuccess({
            fromAgenda,
            agenda,
            response
          }));
        }}
        saveButtonLabel={m(messages.confirmShare)}
      />
    </Canvas>
  );
}
