import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';

import EventEditForm from '../components/EventEditForm.js';
import Canvas from '../components/Canvas.js';
import Loading from '../components/Loading.js';
import useEvent from '../hooks/useEvent.js';
import useEventFormConfig from '../hooks/useEventFormConfig.js';

import contributeReducer from '../reducers/contribute.js';
import utils from '../lib/utils.js';
import usePrefix from '../hooks/usePrefix.js';
import RequestEditionRights from '../components/RequestEditionRights.js';
import Instructions from '../components/Instructions.js';

const messages = defineMessages({
  unpublishWarningWithLink: {
    id: 'AgendaContribute.EventEdit.unpublishWarningWithLink',
    defaultMessage:
      'If modified, the event will be unpublished for moderation. You can also suggest minor changes to moderators by writing a message. [Suggest Change]<a></a>',
  },
});

const willModerateOnUpdate = (event, agendaSettings, me) => {
  if (
    event.state === 2
    && agendaSettings.contribution.moderateOnChangeBy.includes(me.member.role)
  ) return true;
  return false;
};

const { replaceWithStep, schemaWithoutEventFields, filterEventData } = utils;

export default function EventEdit({ agenda, history }) {
  const {
    eventUid, // as a string
  } = useParams();

  const m = useIntl().formatMessage;

  const location = useLocation();

  const prefix = usePrefix(agenda);
  const apiRoot = useSelector((state) => state.settings.apiRoot);

  const dispatch = useDispatch();

  const { config, isLoading, agendaContext, schema } = useEventFormConfig(agenda);

  const { eventIsLoading, event, eventContext } = useEvent(
    agenda.uid,
    eventUid,
    { schema },
  );

  useEffect(() => {
    if (!eventIsLoading && event.draft) {
      replaceWithStep(history, location, prefix, `event/${event.uid}/draft`);
    }
  }, [eventIsLoading, event, history, location, prefix]);

  if (eventIsLoading || isLoading || event?.draft) {
    return <Loading />;
  }

  return (
    <Canvas mode="edit" event={event}>
      {!eventContext.me.authorizations.canEditEvent ? (
        <div className="wsq padding-v-sm">
          <RequestEditionRights agenda={agenda} schema={schema} event={event} />
        </div>
      ) : null}
      {willModerateOnUpdate(event, agenda.settings, eventContext.me) ? (
        <Instructions
          message={m(messages.unpublishWarningWithLink, {
            a: () =>
              `(/${agenda.slug}/events/${event.uid}/suggest-change/conversation/create)`,
          })}
          className="margin-bottom-lg"
        />
      ) : null}
      <EventEditForm
        res={`${apiRoot}${location.pathname}`}
        config={{
          ...config,
          // when event cannot be edited, schema should exclude event fields
          // but when event cannot be edited but has fields linked to extended fields, schema should load disabled event fields.
          schema: eventContext.me?.authorizations?.canEditEvent
            ? schema
            : schemaWithoutEventFields(schema),
        }}
        event={filterEventData({
          event,
          schema,
          canEditEvent: eventContext.me?.authorizations?.canEditEvent,
          canChangeState: agendaContext?.me?.authorizations?.canChangeState,
          displayEventFields: eventContext?.me?.authorizations?.canEditEvent,
        })}
        memberRole={agendaContext?.me?.member?.role}
        canEditEvent={eventContext.me?.authorizations?.canEditEvent}
        onSuccess={(_event, response) => {
          dispatch(
            contributeReducer.eventUpdateSuccess({
              agenda,
              response,
            }),
          );
        }}
        useSubmitModal={willModerateOnUpdate(
          event,
          agenda.settings,
          eventContext.me,
        )}
      />
    </Canvas>
  );
}
