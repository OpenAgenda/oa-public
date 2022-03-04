import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Field, useForm } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';
import { MarkdownInput } from '../../utils/inputs';
import * as agendaActions from '../../reducers/agenda';
import catchFormErrors from '../../utils/catchFormErrors';

function getError(form, fieldname) {
  const fieldState = form.getFieldState(fieldname);
  const errors = form.getState().errors;

  return fieldState?.touched && errors?.[fieldname];
}

function SubmitButton() {
  const { getLabel } = useContext(I18nContext);
  const form = useForm();

  const { dirty, submitting, submitSucceeded, hasValidationErrors } = form.getState();

  if (!dirty && submitSucceeded) {
    return <button type="submit" className="btn btn-success" disabled>{getLabel('saved')}</button>;
  } else if (submitting) {
    return <button type="submit" className="btn btn-primary" disabled>{getLabel('saving')}</button>;
  } else {
    return (
      <button
        type="submit"
        className="btn btn-primary"
        disabled={dirty && !hasValidationErrors ? undefined : true}
      >
        {getLabel('saveModifications')}
      </button>
    );
  }
}

export default function ContributionEdition() {
  const { agenda } = useLayoutData();
  const { getLabel, lang } = useContext(I18nContext);
  const dispatch = useDispatch();

  const initialValues = useMemo(() => agenda.settings.contribution, [agenda.settings.contribution]);
  const [hasInstructions, setHasInstructions] = useState(() => initialValues?.messages?.instructions ?? false);
  const [hasComplete, setHasComplete] = useState(() => initialValues?.messages?.complete ?? false);
  const [hasPublication, setHasPublication] = useState(() => initialValues?.messages?.publication ?? false);

  const onSubmit = useCallback(
    (values, form) => dispatch(agendaActions.edit({
      settings: {
        contribution: values
      }
    }))
      .then(result => form.reset(result.data.agenda))
      .catch(error => catchFormErrors(error, 'settings.contribution')),
    [dispatch]
  );

  return (
    <div className="contribution">
      <div className="row">
        <div className="col-md-7">
          <Form onSubmit={onSubmit} initialValues={initialValues}>
            {({ handleSubmit, form }) => (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className={`radio ${getError(form, 'type') ? 'has-error' : ''}`}>
                    <p><b>
                      <FormattedMessage
                        id="AgendaSettings.contribution.contribution"
                        defaultMessage="Contribution"
                      />
                    </b></p>
                    <label>
                      <Field
                        name="type"
                        component="input"
                        type="radio"
                        value="1"
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
                        name="type"
                        component="input"
                        type="radio"
                        value="2"
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
                    </label><br />
                    <label>
                      <Field
                        name="type"
                        component="input"
                        type="radio"
                        value="0"
                        format={v => v == null ? '' : v.toString()}
                        parse={value => value === undefined ? undefined : parseInt(value)}
                      />
                      <FormattedMessage
                        id="AgendaSettings.contribution.closedContibution"
                        defaultMessage="Closed"
                      />
                      <br />
                      <span className="text-muted">
                        <FormattedMessage
                          id="AgendaSettings.contribution.closedContibutionDesc"
                          defaultMessage="The agenda does not accept new contributions"
                        />
                      </span>
                    </label>
                  </div>
                </div>

                <p><b>{getLabel('contributorsMessages')}</b></p>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => setHasInstructions(prev => !prev)}
                      defaultChecked={hasInstructions}
                    />
                    <p>
                      <b>{getLabel('consigne')}</b>
                      <br />
                      <span className="text-muted">
                        {getLabel('consigneSubLabel')}
                      </span>
                    </p>
                  </label>
                  {hasInstructions ? (
                    <div style={{ paddingLeft: '20px' }}>
                      <Field
                        name="messages.instructions"
                        component={MarkdownInput}
                        lang={lang}
                      />
                    </div>
                  ) : null}
                </div>

                {agenda.credentials.invitationMessage ? (
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setHasComplete(prev => !prev)}
                        defaultChecked={hasComplete}
                      />
                      <p>
                        <b>{getLabel('contributionMessageComplete')}</b>
                        <br />
                        <span className="text-muted">
                          {getLabel('contributionMessageCompleteSubLabel')}
                        </span>
                      </p>
                    </label>
                    {hasComplete ? (
                      <>
                        <div style={{ paddingLeft: '20px' }}>
                          <Field
                            name="messages.complete"
                            component={MarkdownInput}
                            lang={lang}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {agenda.credentials.invitationMessage ? (
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setHasPublication(prev => !prev)}
                        defaultChecked={hasPublication}
                      />
                      <p>
                        <b>{getLabel('contributionMessagePublication')}</b>
                        <br />
                        <span className="text-muted">
                          {getLabel('contributionMessagePublicationSubLabel')}
                        </span>
                      </p>
                    </label>
                    {hasPublication ? (
                      <>
                        <br />
                        <div style={{ paddingLeft: '20px' }}>
                          <Field
                            name="messages.publication"
                            component={MarkdownInput}
                            lang={lang}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <div className="form-group">
                  <div className={`radio ${getError(form, 'useFields') ? 'has-error' : ''}`}>
                    <p><b>{getLabel('contribUseFields')}</b></p>
                    <label>
                      <Field
                        name="useFields"
                        component="input"
                        type="radio"
                        value="1"
                        format={v => (v ? '1' : '0')}
                        parse={v => Boolean(parseInt(v))}
                      />
                      {getLabel('yes')}
                    </label><br />
                    <label>
                      <Field
                        name="useFields"
                        component="input"
                        type="radio"
                        value="0"
                        format={v => (v ? '1' : '0')}
                        parse={v => Boolean(parseInt(v))}
                      />
                      {getLabel('no')}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className={`radio ${getError(form, 'defaultState') ? 'has-error' : ''}`}>
                    <p><b>{getLabel('contribDefaultState')}</b></p>
                    <label>
                      <Field
                        name="defaultState"
                        component="input"
                        type="radio"
                        value="2"
                        format={v => v == null ? '' : v.toString()}
                        parse={value => value === undefined ? undefined : parseInt(value)}
                      />
                      {getLabel('contribDefaultStatePublished')}
                      <br />
                      <span className="text-muted">{getLabel('contribDefaultStatePublishedText')}</span>
                    </label><br />
                    <label>
                      <Field
                        name="defaultState"
                        component="input"
                        type="radio"
                        value="0"
                        format={v => v == null ? '' : v.toString()}
                        parse={value => value === undefined ? undefined : parseInt(value)}
                      />
                      {getLabel('contribDefaultStateUnpublished')}
                      <br />
                      <span className="text-muted">{getLabel('contribDefaultStateUnpublishedText')}</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className={`checkbox ${getError(form, 'moderateOnChangeBy') ? 'has-error' : ''}`}>
                    <p><b>{getLabel('contribModerateOnChangeBy')}</b></p>
                    <label>
                      <Field
                        name="moderateOnChangeBy"
                        component="input"
                        type="checkbox"
                        format={v => Array.isArray(v) ? v.includes('contributor') : false}
                        parse={value => value ? ['contributor'] : null}
                      />
                      {getLabel('contribModerateOnChangeByUnpublish')}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <p><b>
                    <FormattedMessage
                      id="AgendaSetting.contribution.contributionRestrictDates"
                      defaultMessage="Restrict input dates"
                    />
                  </b></p>
                  <a
                    className="margin-right-sm"
                    style={{ cursor: 'pointer' }}
                    href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=limitDates`}
                  >
                    {getLabel('requestLimitDates')}
                  </a>
                </div>

                <div className="text-right">
                  <SubmitButton />
                </div>
              </form>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
