import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import getEventTitle from '../lib/getEventTitle';

const messages = defineMessages({
  shareRestrictionInfo: {
    id: 'AgendaContribute.ErrorMessage.shareRestrictionInfo',
    defaultMessage: 'The following issues must be addressed to allow make the event "{event}" shareable on the agenda "{agenda}"'
  },
  suggestChange: {
    id: 'AgendaContribute.ErrorMessage.suggestChange',
    defaultMessage: 'Suggest a change'
  },
  cancelChange: {
    id: 'AgendaContribute.ErrorMessage.cancelChange',
    defaultMessage: 'Cancel the share'
  },
  longDescription: {
    id: 'AgendaContribute.ErrorMessage.longDescription',
    defaultMessage: 'Long description'
  },
  imageCredits: {
    id: 'AgendaContribute.ErrorMessage.imageCredits',
    defaultMessage: 'Image credits'
  },
  required: {
    id: 'AgendaContribute.ErrorMessage.required',
    defaultMessage: 'Required'
  },
  conditions: {
    id: 'AgendaContribute.ErrorMessage.conditions',
    defaultMessage: 'Conditions'
  },
  registration: {
    id: 'AgendaContribute.ErrorMessage.registration',
    defaultMessage: 'Registration'
  },
  timings: {
    id: 'AgendaContribute.ErrorMessage.timings',
    defaultMessage: 'Timings'
  },
  endLessThanBegin: {
    id: 'AgendaContribute.ErrorMessage.endLessThanBegin',
    defaultMessage: 'At least one timing is invalid with an begin time occuring after the end time'
  }
});

export default function ErrorMessage({
  errors,
  event,
  agenda,
  suggestChangeRes,
  onCancel,
  canEditEvent
}) {
  const {
    locale,
    formatMessage: m
  } = useIntl();

  return (
    <div className="error-summary boxed padding-v-md padding-h-md text-left margin-bottom-md">
      <strong>
        {m(messages.shareRestrictionInfo, {
          event: getEventTitle(event, locale),
          agenda: agenda.title
        })}
      </strong>
      <ul className={canEditEvent ? 'padding-top-md padding-h-md' : 'padding-v-md padding-h-md'}>
        {errors.map(err => (
          <li>
            <strong>{messages?.[err.field] ? m(messages[err.field]) : err.field}</strong>: {messages?.[err.code] ? m(messages[err.code]) : err.code}
          </li>
        ))}
      </ul>
      {canEditEvent ? null : (
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
      )}
    </div>
  );
}
