import React, { useContext } from 'react';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';

export default function CreationSecondStep({
  previousPage,
  title,
  submitting,
  form
}) {
  const { getLabel } = useContext(I18nContext);

  const getError = fieldname => {
    const fieldState = form.getFieldState(fieldname);
    const errors = form.getState().errors;

    return fieldState?.touched && errors?.[fieldname];
  };

  return (
    <div>
      <h2 className="margin-bottom-md">{title}</h2>
      <div className="form-group">
        <div className={`radio ${getError('settings.contribution.type') ? 'has-error' : ''}`}>
          <p><b>
            <FormattedMessage
              id="AgendaSettings.contribution.contribution"
              defaultMessage="Contribution"
            />
          </b></p>
          <label>
            <Field
              name="settings.contribution.type"
              component="input"
              type="radio"
              value="2"
              format={v => v == null ? '' : v.toString()}
              parse={value => value === undefined ? undefined : parseInt(value)}
            />
            <FormattedMessage
              id="AgendaSettings.contribution.openContribution"
              defaultMessage="Open"
            />
            <br />
            <span className="text-muted">
              <FormattedMessage
                id="AgendaSettings.contribution.openContributionDesc"
                defaultMessage="Any user can add events, under your moderation"
              />
            </span>
          </label><br />
          <label>
            <Field
              name="settings.contribution.type"
              component="input"
              type="radio"
              value="1"
              format={v => v == null ? '' : v.toString()}
              parse={value => value === undefined ? undefined : parseInt(value)}
            />
            <FormattedMessage
              id="AgendaSettings.contribution.reducedContribution"
              defaultMessage="Reduced"
            />
            <br />
            <span className="text-muted">
              <FormattedMessage
                id="AgendaSettings.contribution.reducedContributionDesc"
                defaultMessage="Only invited users can add events"
              />
            </span>
          </label>
        </div>
      </div>
      <div className="form-group">
        <div className={`radio ${getError('settings.contribution.defaultState') ? 'has-error' : ''}`}>
          <p><b>{getLabel('contribDefaultState')}</b></p>
          <label>
            <Field
              name="settings.contribution.defaultState"
              component="input"
              type="radio"
              value="2"
              format={v => v == null ? '' : v.toString()}
              parse={value => value === undefined ? undefined : parseInt(value)}
            />
            {getLabel('contribDefaultStatePublished')}<br />
            <span className="text-muted">{getLabel('contribDefaultStatePublishedText')}</span>
          </label><br />
          <label>
            <Field
              name="settings.contribution.defaultState"
              component="input"
              type="radio"
              value="0"
              format={v => v == null ? '' : v.toString()}
              parse={value => value === undefined ? undefined : parseInt(value)}
            />
            {getLabel('contribDefaultStateUnpublished')}<br />
            <span className="text-muted">{getLabel('contribDefaultStateUnpublishedText')}</span>
          </label>
        </div>
      </div>
      <div className="form-group">
        <div className="checkbox">
          <p><b>
            <FormattedMessage id="AgendaSettings.CreationSecondStep.formEvent" defaultMessage="Form event" />
          </b></p>
          <label>
            <Field
              name="onlineEvents"
              component="input"
              type="checkbox"
            />
            <FormattedMessage
              id="AgendaSettings.CreationSecondStep.onlineEvents"
              defaultMessage="Allow online event entry"
            />
            <br />
            <span className="text-muted">
              <FormattedMessage
                id="AgendaSettings.CreationSecondStep.onlineEventsDesc"
                defaultMessage="Online events can be associated with physical locations"
              />
            </span>
          </label>
          <br />
          <label>
            <Field
              name="statusField"
              component="input"
              type="checkbox"
            />
            <FormattedMessage
              id="AgendaSettings.CreationSecondStep.statusField"
              defaultMessage="Show status field (complete, postponed, cancelled) in the form"
            />
            <br />
            <span className="text-muted">
              <FormattedMessage
                id="AgendaSettings.CreationSecondStep.statusFieldDesc"
                defaultMessage="The state of the event can also be modified from the administration of the agenda"
              />
            </span>
          </label>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-default"
        onClick={previousPage}
        disabled={submitting}
      >
        {getLabel('previous')}
      </button>
      <div className="pull-right">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {getLabel('createAgenda')}

          {submitting ? (
            <span className="margin-left-xs">
              <Spinner mode="inline" />
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
