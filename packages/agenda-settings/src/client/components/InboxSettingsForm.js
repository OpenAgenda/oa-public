import _ from 'lodash';
import React, { useCallback, useContext, useState } from 'react';
import { Form, Field } from 'react-final-form';
import cn from 'classnames';
import { useDispatch } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import { email as emailValidator } from '@openagenda/validators';
import I18nContext from '../contexts/I18nContext';
import { BasicInput } from '../utils/inputs';
import * as agendaActions from '../reducers/agenda';
import catchFormErrors from '../utils/catchFormErrors';

const isEmail = emailValidator();

function validate(values) {
  const errors = {};

  if (values.email) {
    try {
      isEmail(values.email);
    } catch (e) {
      errors.email = 'email.invalid';
    }
  }

  if (values.enabled && !values.email) {
    errors.email = 'required';
  }

  if (values.subject && values.subject.length > 255) {
    errors.subject = 'string.toolong';
  }

  return errors;
}

function getFormValues(agenda) {
  return {
    enabled: _.get(agenda, 'settings.inbox.mailto.enabled', false),
    email: _.get(agenda, 'settings.inbox.mailto.email', null),
    subject: _.get(agenda, 'settings.inbox.mailto.subject', null)
  };
}

export default function InboxSettingsForm() {
  const { agenda } = useLayoutData();
  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();

  const [initialValues] = useState(() => getFormValues(agenda));

  const onSubmit = useCallback(
    (data, form) => dispatch(agendaActions.edit({ settings: { inbox: { mailto: data } } }))
      .then(result => form.reset(getFormValues(result.data.agenda)))
      .catch(error => catchFormErrors(error, 'settings.inbox.mailto')),
    [dispatch]
  );

  return (
    <Form
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, hasValidationError }) => (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="checkbox">
              <label>
                <Field
                  name="enabled" /* mailto enabled, inbox disabled */
                  component="input"
                  type="checkbox"
                />
                {getLabel('enableMailtoDesc')}
              </label>
            </div>
          </div>

          <Field
            name="email"
            component={BasicInput}
            type="text"
            label={getLabel('receptionEmail')}
            placeholder={getLabel('emailPlaceholder')}
            className="form-control"
            subLabel={<div>{getLabel('mailtoEmailDesc')}</div>}
            parse={_.identity} // to keep empty value
          />

          <Field
            name="subject"
            component={BasicInput}
            type="text"
            label={getLabel('subjectLabel')}
            placeholder={getLabel('subjectDesc')}
            className="form-control"
            parse={_.identity} // to keep empty value
          />

          <button
            type="submit"
            className={cn('btn btn-primary', { disabled: pristine || hasValidationError })}
            disabled={pristine || hasValidationError ? true : undefined}
          >
            {getLabel('update')}
          </button>
        </form>
      )}
    </Form>
  );
};
