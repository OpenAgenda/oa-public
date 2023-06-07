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

function validate(values) {
  const errors = {};

  if (values.googleAnalytics && values.googleAnalytics.length > 255) {
    errors.googleAnalytics = 'string.toolong';
  }

  return errors;
}

function getFormValues(agenda) {
  return {
    googleAnalytics: _.get(agenda, 'settings.tracking.googleAnalytics', null),
    googleAnalyticsSecret: _.get(agenda, 'settings.tracking.googleAnalyticsSecret', null),
    secretCheck: !!_.get(agenda, 'settings.tracking.googleAnalyticsSecret', null),
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
      mutators={{
        setFormAttribute: ([fieldName, fieldVal], state, { changeValue }) => {
          changeValue(state, fieldName, () => fieldVal);
        }
      }}
    >
      {({ handleSubmit, pristine, hasValidationError, form }) => (
        <form onSubmit={handleSubmit}>
          <p>{getLabel('statsDescription')}</p>

          <Field
            onChange={v => {
              if (v?.substr(0, 1) !== 'G') {
                form.mutators.setFormAttribute("secretCheck", false);
                form.mutators.setFormAttribute("googleAnalyticsSecret", "");
              }
            }}
            name="googleAnalytics"
            component={BasicInput}
            type="text"
            label={getLabel('googleAnalyticsId')}
            placeholder="GA_TRACKING_ID"
            className="form-control"
            parse={_.identity} // to keep empty value
          />

          <Field
            name="secretCheck"
            type="checkbox"
            subscription={{ value: true }}
            render={({ input }) => {
              const googleAnalyticsValue = form.getState().values.googleAnalytics;
              const disabled = googleAnalyticsValue ? !(googleAnalyticsValue?.substr(0, 1) === 'G') : true;
              return (
                <div className="checkbox">
                  <label for='gaSecretCheckbox'>
                    <input id='gaSecretCheckbox' {...input} disabled={disabled} checked={!!form.getState().values?.secretCheck && !disabled} title={getLabel('googleAnalyticsTitle')}/>
                    <b>{getLabel('googleAnalyticsLabel')}</b>
                    <br />
                    <span className="text-muted">{getLabel('googleAnalyticsInfo')}</span>
                  </label>
                </div>
              )
            }}
          />

          {form.getState().values?.secretCheck ? (
            <Field
              name="googleAnalyticsSecret"
              component={BasicInput}
              type="text"
              label={getLabel('googleAnalyticsSecret')}
              placeholder="GA_TRACKING_SECRET"
              className="form-control"
              parse={_.identity} // to keep empty value
            />
          ) : null}

          < button
            type="submit"
            className={cn('btn btn-primary', { disabled: pristine || hasValidationError })}
            disabled={pristine || hasValidationError ? true : undefined}
          >
            {getLabel('update')}
          </button>
        </form>
      )
      }
    </Form >
  );
}
