import _ from 'lodash';
import React, { useContext, useState } from 'react';
import { Form, Field } from 'react-final-form';
import cn from 'classnames';
import { useLayoutData } from '@openagenda/react-shared';
import { email as emailValidator } from '@openagenda/validators';
import I18nContext from '../contexts/I18nContext';
import { BasicInput } from '../utils/inputs';

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

export default function InboxSettingsForm({ onSubmit }) {
  const { agenda } = useLayoutData();

  const { getLabel } = useContext(I18nContext);

  const [initialValues] = useState(() => ({
    enabled: _.get(agenda, 'settings.inbox.mailto.enabled', false),
    email: _.get(agenda, 'settings.inbox.mailto.email', null),
    subject: _.get(agenda, 'settings.inbox.mailto.subject', null)
  }));

  return (
    <Form
      initialValues={initialValues}
      validate={validate}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, invalid }) => (
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
          />

          <Field
            name="subject"
            component={BasicInput}
            type="text"
            label={getLabel('subjectLabel')}
            placeholder={getLabel('subjectDesc')}
            className="form-control"
          />

          <button
            type="submit"
            className={cn('btn btn-primary', { disabled: pristine || invalid })}
            disabled={pristine || invalid ? true : undefined}
          >
            {getLabel('update')}
          </button>
        </form>
      )}
    </Form>
  );
};
