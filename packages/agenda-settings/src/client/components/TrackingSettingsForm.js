import _ from 'lodash';
import React, { useCallback, useContext, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import cn from 'classnames';
import { useDispatch } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import { BasicInput } from '../utils/inputs';
import * as agendaActions from '../reducers/agenda';
import catchFormErrors from '../utils/catchFormErrors';

function validate( values ) {
  const errors = {};

  if ( values.googleAnalytics && values.googleAnalytics.length > 255 ) {
    errors.googleAnalytics = 'string.toolong';
  }

  return errors;
}

function getFormValues(agenda) {
  return {
    googleAnalytics: _.get(agenda, 'settings.tracking.googleAnalytics', null)
  };
}

export default function TrackingSettingsForm() {
  const { agenda } = useLayoutData();
  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();

  const initialValues = useMemo(() => getFormValues(agenda), [agenda]);

  const onSubmit = useCallback(
    (data, form) => dispatch(agendaActions.edit({ settings: { tracking: data } }))
      .then(result => form.reset(result.data.agenda.settings.tracking))
      .catch(error => catchFormErrors(error, 'settings.tracking')),
    [dispatch]
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={validate}
    >
      {({ handleSubmit, pristine, hasValidationError }) => (
        <form onSubmit={handleSubmit}>
          <p>{getLabel( 'statsDescription' )}</p>

          <Field
            name="googleAnalytics"
            component={BasicInput}
            type="text"
            label={getLabel( 'googleAnalyticsId' )}
            placeholder="GA_TRACKING_ID"
            className="form-control"
            parse={_.identity} // to keep empty value
          />

          <button
            type="submit"
            className={cn( 'btn btn-primary', { disabled: pristine || hasValidationError } )}
            disabled={pristine || hasValidationError ? true : undefined}
          >
            {getLabel( 'update' )}
          </button>
        </form>
      )}
    </Form>
  );
}
