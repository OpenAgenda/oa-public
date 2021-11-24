import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import getEventTitle from '../lib/getEventTitle';

const messages = defineMessages({
  shareRestrictionInfo: {
    id: 'AgendaContribute.EventShare.shareRestrictionInfo',
    defaultMessage: 'The following issues must be addressed to allow make the event "{event}" shareable on the agenda "{agenda}"'
  },
  suggestChange: {
    id: 'AgendaContribute.EventShare.suggestChange',
    defaultMessage: 'Suggest a change'
  },
  cancelChange: {
    id: 'AgendaContribute.EventShare.cancelChange',
    defaultMessage: 'Cancel the share'
  },
  longDescription: {
    id: 'AgendaContribute.EventShare.longDescription',
    defaultMessage: 'Long description'
  },
  imageCredits: {
    id: 'AgendaContribute.EventShare.imageCredits',
    defaultMessage: 'Image credits'
  },
  required: {
    id: 'AgendaContribute.EventShare.required',
    defaultMessage: 'Required'
  },
  conditions: {
    id: 'AgendaContribute.EventShare.conditions',
    defaultMessage: 'Conditions'
  },
  registration: {
    id: 'AgendaContribute.EventShare.registration',
    defaultMessage: 'Registration'
  }
});

export default function ErrorMessage({
  errors,
  event,
  agenda,
  suggestChangeRes,
  onCancel
}) {
  const {
    locale,
    formatMessage: m
  } = useIntl();

  return (
    <div className="error-summary boxed padding-v-md padding-h-md text-left">
      <strong>
        {m(messages.shareRestrictionInfo, {
          event: getEventTitle(event, locale),
          agenda: agenda.title
        })}
      </strong>
      <ul className="padding-v-md padding-h-md">
        {errors.map(err => (
          <li>
            <strong>{m(messages[err.field])}</strong>: {m(messages[err.code])}
          </li>
        ))}
      </ul>
      <div className="text-center">
        <a href={suggestChangeRes} className="btn btn-primary margin-h-sm">{m(messages.suggestChange)}</a>
        <button
          type="button"
          className="btn btn-default margin-h-sm"
          onClick={onCancel}
        >
          {m(messages.cancelChange)}
        </button>
      </div>
    </div>
  );
}
