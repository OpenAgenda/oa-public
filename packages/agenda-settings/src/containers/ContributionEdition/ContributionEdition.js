import _ from 'lodash';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Field, useForm } from 'react-final-form';
import { FormattedMessage, useIntl, defineMessages } from 'react-intl';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext.js';
import { MarkdownInput } from '../../utils/inputs.js';
import * as agendaActions from '../../reducers/agenda.js';
import catchFormErrors from '../../utils/catchFormErrors.js';

const messages = defineMessages({
  GDPRInformationPlaceholder: {
    id: 'AgendaSettings.contribution.GDPRInformationPlaceholder',
    defaultMessage: 'This information will be visible to the agenda moderators',
  },
});

const completedPrefix = (agenda, prefix) =>
  prefix.replace(':slug', agenda.slug);

function getError(form, fieldname) {
  const fieldState = form.getFieldState(fieldname);
  const { errors } = form.getState();

  return fieldState?.touched && errors?.[fieldname];
}

function SubmitButton({
  hasInstructions,
  hasComplete,
  hasPublication,
  hasGDPRInformation,
}) {
  const { getLabel } = useContext(I18nContext);
  const form = useForm();

  const {
    dirty,
    submitting,
    submitSucceeded,
    hasValidationErrors,
    initialValues,
  } = form.getState();

  const messageUnchecked = (!!initialValues?.messages?.instructions?.length && !hasInstructions)
    || (!!initialValues?.messages?.complete?.length && !hasComplete)
    || (!!initialValues?.messages?.publication?.length && !hasPublication)
    || (!!initialValues?.messages?.GDPRInformation?.length && !hasGDPRInformation);

  const hasChanged = dirty || messageUnchecked;

  if (!hasChanged && submitSucceeded) {
    return (
      <button type="submit" className="btn btn-success" disabled>
        {getLabel('saved')}
      </button>
    );
  }
  if (submitting) {
    return (
      <button type="submit" className="btn btn-primary" disabled>
        {getLabel('saving')}
      </button>
    );
  }
  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={hasChanged && !hasValidationErrors ? undefined : true}
    >
      {getLabel('saveModifications')}
    </button>
  );
}

export default function ContributionEdition() {
  const { agenda } = useLayoutData();
  const intl = useIntl();
  const { getLabel, lang } = useContext(I18nContext);
  const dispatch = useDispatch();
  const prefix = completedPrefix(
    agenda,
    useSelector((state) => state.settings.prefix),
  );
  const initialValues = useMemo(
    () => agenda.settings.contribution,
    [agenda.settings.contribution],
  );
  const [hasInstructions, setHasInstructions] = useState(
    () => !!initialValues?.messages?.instructions?.length,
  );
  const [hasComplete, setHasComplete] = useState(
    () => !!initialValues?.messages?.complete?.length,
  );
  const [hasPublication, setHasPublication] = useState(
    () => !!initialValues?.messages?.publication?.length,
  );
  const [hasGDPRInformation, setHasGDPRInformation] = useState(
    () => !!initialValues?.messages?.GDPRInformation?.length,
  );

  const onSubmit = useCallback(
    (values, form) =>
      dispatch(
        agendaActions.edit({
          settings: {
            contribution: {
              ...values,
              messages: {
                instructions: hasInstructions
                  ? values.messages.instructions
                  : null,
                complete: hasComplete ? values.messages.complete : null,
                publication: hasPublication
                  ? values.messages.publication
                  : null,
                GDPRInformation: hasGDPRInformation
                  ? values.messages.GDPRInformation
                  : null,
              },
            },
          },
        }),
      )
        .then((result) => {
          const newContribSettings = result.agenda.settings.contribution;

          form.reset(newContribSettings);
          setHasInstructions(
            !!newContribSettings?.messages?.instructions?.length,
          );
          setHasComplete(!!newContribSettings?.messages?.complete?.length);
          setHasPublication(
            !!newContribSettings?.messages?.publication?.length,
          );
          setHasGDPRInformation(
            !!newContribSettings?.messages?.GDPRInformation?.length,
          );
        })
        .catch((error) => catchFormErrors(error, 'settings.contribution')),
    [
      dispatch,
      hasInstructions,
      hasComplete,
      hasPublication,
      hasGDPRInformation,
    ],
  );

  return (
    <div className="contribution">
      <div className="row">
        <div className="col-md-7">
          <Form onSubmit={onSubmit} initialValues={initialValues}>
            {({ handleSubmit, form }) => (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div
                    className={`radio ${getError(form, 'type') ? 'has-error' : ''}`}
                  >
                    <p>
                      <b>
                        <FormattedMessage
                          id="AgendaSettings.contribution.contribution"
                          defaultMessage="Contribution"
                        />
                      </b>
                    </p>
                    <label>
                      <Field
                        name="type"
                        component="input"
                        type="radio"
                        value="1"
                        format={(v) => (v == null ? '' : v.toString())}
                        parse={(value) =>
                          (value === undefined ? undefined : parseInt(value, 10))}
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
                    </label>
                    <br />
                    <label>
                      <Field
                        name="type"
                        component="input"
                        type="radio"
                        value="2"
                        format={(v) => (v == null ? '' : v.toString())}
                        parse={(value) =>
                          (value === undefined ? undefined : parseInt(value, 10))}
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
                    <br />
                    <label>
                      <Field
                        name="type"
                        component="input"
                        type="radio"
                        value="0"
                        format={(v) => (v == null ? '' : v.toString())}
                        parse={(value) =>
                          (value === undefined ? undefined : parseInt(value, 10))}
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

                <div className="form-group">
                  <div
                    className={`radio ${getError(form, 'useFields') ? 'has-error' : ''}`}
                  >
                    <p>
                      <b>
                        <FormattedMessage
                          id="AgendaSettings.contribution.contribUseFields"
                          defaultMessage="Invite members to present themselves (organization, phone, name, title, email, <a>customizable fields</a>)"
                          values={{
                            a: (chunks) => (
                              <a href={`${prefix}/schema/member`}>{chunks}</a>
                            ),
                          }}
                        />
                      </b>
                    </p>
                    <label>
                      <Field
                        name="useFields"
                        component="input"
                        type="radio"
                        value="1"
                        format={(v) => (v ? '1' : '0')}
                        parse={(v) => Boolean(parseInt(v, 10))}
                      />
                      {getLabel('yes')}
                    </label>
                    <br />
                    <label>
                      <Field
                        name="useFields"
                        component="input"
                        type="radio"
                        value="0"
                        format={(v) => (v ? '1' : '0')}
                        parse={(v) => Boolean(parseInt(v, 10))}
                      />
                      {getLabel('no')}
                    </label>
                  </div>
                </div>

                <p>
                  <b>{getLabel('contributorsMessages')}</b>
                </p>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => setHasInstructions((prev) => !prev)}
                      checked={hasInstructions}
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
                        parse={_.identity} // to keep empty value
                      />
                    </div>
                  ) : null}
                </div>

                {form.getFieldState('useFields')?.value ? (
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setHasGDPRInformation((prev) => !prev)}
                        checked={hasGDPRInformation}
                      />
                      <p>
                        <b>{getLabel('GDPRInformation')}</b>
                        <br />
                        <span className="text-muted">
                          {getLabel('GDPRInformationSubLabel')}
                        </span>
                      </p>
                    </label>
                    {hasGDPRInformation ? (
                      <div style={{ paddingLeft: '20px' }}>
                        <Field
                          name="messages.GDPRInformation"
                          component={MarkdownInput}
                          lang={lang}
                          parse={_.identity}
                          placeholder={intl.formatMessage(
                            messages.GDPRInformationPlaceholder,
                          )}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {agenda.credentials?.invitationMessage ? (
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setHasComplete((prev) => !prev)}
                        checked={hasComplete}
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
                      <div style={{ paddingLeft: '20px' }}>
                        <Field
                          name="messages.complete"
                          component={MarkdownInput}
                          lang={lang}
                          parse={_.identity}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {agenda.credentials?.invitationMessage ? (
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setHasPublication((prev) => !prev)}
                        checked={hasPublication}
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
                            parse={_.identity} // to keep empty value
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}

                <div className="form-group">
                  <div
                    className={`radio ${getError(form, 'defaultState') ? 'has-error' : ''}`}
                  >
                    <p>
                      <b>{getLabel('contribDefaultState')}</b>
                    </p>
                    <label>
                      <Field
                        name="defaultState"
                        component="input"
                        type="radio"
                        value="2"
                        format={(v) => (v == null ? '' : v.toString())}
                        parse={(value) =>
                          (value === undefined ? undefined : parseInt(value, 10))}
                      />
                      {getLabel('contribDefaultStatePublished')}
                      <br />
                      <span className="text-muted">
                        {getLabel('contribDefaultStatePublishedText')}
                      </span>
                    </label>
                    <br />
                    <label>
                      <Field
                        name="defaultState"
                        component="input"
                        type="radio"
                        value="0"
                        format={(v) => (v == null ? '' : v.toString())}
                        parse={(value) =>
                          (value === undefined ? undefined : parseInt(value, 10))}
                      />
                      {getLabel('contribDefaultStateUnpublished')}
                      <br />
                      <span className="text-muted">
                        {getLabel('contribDefaultStateUnpublishedText')}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div
                    className={`checkbox ${getError(form, 'moderateOnChangeBy') ? 'has-error' : ''}`}
                  >
                    <p>
                      <b>{getLabel('contribModerateOnChangeBy')}</b>
                    </p>
                    <label>
                      <Field
                        name="moderateOnChangeBy"
                        component="input"
                        type="checkbox"
                        format={(v) =>
                          (Array.isArray(v) ? v.includes('contributor') : false)}
                        parse={(value) => (value ? ['contributor'] : null)}
                      />
                      {getLabel('contribModerateOnChangeByUnpublish')}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="checkbox">
                    <p>
                      <b>
                        <FormattedMessage
                          id="AgendaSetting.contribution.memberRights"
                          defaultMessage="Member Rights"
                        />
                      </b>
                    </p>
                    <label>
                      <Field
                        name="modoCanInviteModo"
                        component="input"
                        type="checkbox"
                        format={(v) => v}
                        parse={(value) => value || false}
                      />
                      <FormattedMessage
                        id="AgendaSetting.contribution.modosInviteModosLabel"
                        defaultMessage="Allow Moderators to invite moderators"
                      />
                    </label>
                  </div>
                </div>

                <div className="text-right">
                  <SubmitButton
                    hasInstructions={hasInstructions}
                    hasComplete={hasComplete}
                    hasPublication={hasPublication}
                    hasGDPRInformation={hasGDPRInformation}
                  />
                </div>
              </form>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
