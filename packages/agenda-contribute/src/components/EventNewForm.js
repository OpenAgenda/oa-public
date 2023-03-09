import { defineMessages, useIntl } from 'react-intl';

import EventForm from '@openagenda/event-form/build';
import URLDefaults from '../lib/URLDefaults';

import ButtonSpinner from './ButtonSpinner';

const {
  eventWithDefaults,
  get: getURLDefaults,
} = URLDefaults;

const messages = defineMessages({
  create: {
    id: 'AgendaContribute.EventNew.create',
    defaultMessage: 'Create the event',
  },
  updateDraft: {
    id: 'AgendaContribute.EventNew.updateDraft',
    defaultMessage: 'Update draft',
  },
  deleteDraft: {
    id: 'AgendaContribute.EventNew.deleteDraft',
    defaultMessage: 'Delete the draft',
  },
  draft: {
    id: 'AgendaContribute.EventNew.draft',
    defaultMessage: 'Save as draft',
  },
});

function EventNewForm({
  config,
  event,
  onSuccess,
  onDraftDelete,
  memberRole,
  location,
  res,
}) {
  const m = useIntl().formatMessage;

  return (
    <EventForm
      {...config}
      res={res}
      role={memberRole}
      includeEventFields
      values={eventWithDefaults(event, getURLDefaults(location))}
      onSubmitSuccess={onSuccess}
      actionComponents={[{
        position: 'bottom',
        Component: ({ onSubmit, loading }) => (
          <div className="wsq padding-all-md">
            {event?.draft ? (
              <button
                type="button"
                className="btn btn-danger btn-block margin-bottom-md"
                disabled={loading}
                onClick={() => onDraftDelete()}
              >
                {m(messages.deleteDraft)}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-default btn-block margin-bottom-md"
              disabled={loading}
              onClick={e => onSubmit(e, { draft: true })}
            >
              {m(messages[event?.draft ? 'updateDraft' : 'draft'])}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={loading}
              onClick={onSubmit}
            >
              {m(messages.create)}
            </button>
            {loading ? <ButtonSpinner /> : null}
          </div>
        ),
      }]}
    />
  );
}

export default EventNewForm;
