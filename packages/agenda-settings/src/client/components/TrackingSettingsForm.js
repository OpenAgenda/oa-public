import _ from 'lodash';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { isEqual } from 'lodash';
import Select from 'react-select';
import cn from 'classnames';
import { useDispatch } from 'react-redux';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import { BasicInput, InputGroup } from '../utils/inputs';
import * as agendaActions from '../reducers/agenda';
import catchFormErrors from '../utils/catchFormErrors';

function validate(values) {
  const errors = {};

  if (values.googleAnalytics && values.googleAnalytics.length > 255) {
    errors.googleAnalytics = 'string.toolong';
  }
  if (values.matomoUrl1 && !parseInt(values.matomoSiteId)) {
    errors.matomoSiteId = 'not a number'
  }
  return errors;
}

function splitOnFirstOccurrence(inputString, charToSplit) {
  const indexOfChar = inputString.indexOf(charToSplit);
  if (indexOfChar !== -1) {
    const firstPart = inputString.slice(0, indexOfChar);
    const secondPart = inputString.slice(indexOfChar);
    return [firstPart, secondPart];
  } else {
    return [inputString, ""];
  }
}

function matomoUrlInitialValue(tracking) {
  const matomoUrls = {
    matomoUrl1: null,
    matomoUrl2: null,
  }
  if (tracking?.matomoUrl) {
    const splitUrl = splitOnFirstOccurrence(tracking.matomoUrl, '.');
    matomoUrls.matomoUrl1 = splitUrl[0];
    matomoUrls.matomoUrl2 = splitUrl[1];
  }
  return matomoUrls;
}

function getFormValues(agenda) {
  return {
    googleAnalytics: _.get(agenda, 'settings.tracking.googleAnalytics', null),
    googleAnalyticsSecret: _.get(agenda, 'settings.tracking.googleAnalyticsSecret', null),
    secretCheck: !!_.get(agenda, 'settings.tracking.googleAnalyticsSecret', null),
    matomoSiteId: _.get(agenda, 'settings.tracking.matomoSiteId', null),
    matomoAskForConsent: agenda?.settings?.tracking?.matomoAskForConsent === false ? false : true,
    ...matomoUrlInitialValue(agenda.settings.tracking)
  };
}

function getServiceInitialValue(agenda) {
  if (agenda?.settings?.tracking?.googleAnalytics) return { label: 'Google Analytics', value: 'ga' };
  if (agenda?.settings?.tracking?.matomoUrl) return { label: 'Matomo', value: 'matomo' };
  return null;
}

export default function TrackingSettingsForm() {
  const { agenda } = useLayoutData();
  const { getLabel } = useContext(I18nContext);
  const [service, setService] = useState(getServiceInitialValue(agenda));
  const dispatch = useDispatch();

  const initialValues = useMemo(() => getFormValues(agenda), [agenda]);

  const onSubmit = useCallback(
    (data, form) => {
      if (data.matomoUrl1 && !data.matomoUrl2) {
        data = { ...data, matomoUrl: `${data.matomoUrl1}.matomo.cloud/` }
      }
      if (data.matomoUrl1 && data.matomoUrl2) {
        data = { ...data, matomoUrl: `${data.matomoUrl1}${data.matomoUrl2}` }
      }
      return dispatch(agendaActions.edit({ settings: { tracking: data } }))
        .then(result => form.reset(getFormValues(result.data.agenda/* .settings.tracking */)))
        .catch(error => catchFormErrors(error, 'settings.tracking'))
    },
    [dispatch]
  );

  const selectOptions = [{ label: 'Matomo', value: 'matomo' }, { label: 'Google Analytics', value: 'ga' }]

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
          <p>{getLabel('statsDescription')} <a href={'https://doc.openagenda.com/mesurer-la-consultation-de-son-agenda/'}>{getLabel('moreInfo')}</a></p>

          <div className="margin-bottom-sm">
            <Select
              disabled={false}
              options={selectOptions}
              styles={{
                // Fixes the overlapping problem of the component
                menu: provided => ({ ...provided, zIndex: 9999 })
              }}
              value={service}
              onChange={val => {
                setService(val)
              }}
              clearable={false}
              placeholder={getLabel('trackSelectPlaceholder')}
            />
          </div>

          <div className="margin-left-sm">
            {service?.value === 'ga' ? (
              <>
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
                        <label htmlFor='gaSecretCheckbox'>
                          <input id='gaSecretCheckbox' {...input} disabled={disabled} checked={!!form.getState().values?.secretCheck && !disabled} title={getLabel('googleAnalyticsTitle')} />
                          <b>{getLabel('googleAnalyticsLabel')}</b>
                          <br />
                          <span className="text-muted">{getLabel('googleAnalyticsInfo')}</span>
                        </label>
                      </div>
                    )
                  }}
                />
              </>
            ) : null}

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

            {service?.value === 'matomo' ? (
              <>
                <div className="form-group">
                  <label htmlFor="matomUrl">Url</label>
                  <div className="input-group">
                    <span className="input-group-addon" id="basic-addon1">https://</span>
                    <input className="form-control" type="text" name="matomoUrl1" placeholder="example" value={form.getState().values?.matomoUrl1 || ''}
                      onChange={v => form.mutators.setFormAttribute('matomoUrl1', v.target.value)}
                    />
                    <div className="input-group-addon input-group-addon-right-25">
                      <input className="form-control" type="text" name="matomoUrl2" placeholder=".matomo.cloud/" value={form.getState().values?.matomoUrl2 || ''}
                        onChange={v => form.mutators.setFormAttribute('matomoUrl2', v.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Field
                  name="matomoSiteId"
                  component={BasicInput}
                  type="text"
                  label={getLabel('matomoSiteId')}
                  placeholder="1"
                  className="form-control"
                  parse={_.identity} // to keep empty value
                />
                <Field
                  name="matomoAskForConsent"
                  type="checkbox"
                  subscription={{ value: true }}
                  render={({ input }) => {
                    return (
                      <div className="checkbox">
                        <label htmlFor='matomoAskForConsent'>
                          <input id='matomoAskForConsent' {...input} checked={!!form.getState().values?.matomoAskForConsent} title='matomoAskForConsent' />
                          <b>{getLabel('matomoAskForConsent')}</b>
                          <br />
                          <span className="text-muted">{getLabel('matomoAskForConsentInfo')}</span>
                        </label>
                      </div>
                    )
                  }}
                />

                <div className="info-block-sm margin-bottom-sm">
                  {getLabel('matomoCustomConfig')}
                  <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=matomoSettings}`} className="link-primary">
                    {getLabel('matomoSupport')}
                  </a>
                </div>
              </>) : null}
          </div>

          < button
            type="submit"
            className={cn('btn btn-primary', { disabled: isEqual(form.getState().initialValues, form.getState().values) || hasValidationError })}
            disabled={isEqual(form.getState().initialValues, form.getState().values) || hasValidationError ? true : undefined}
          >
            {getLabel('update')}
          </button>
        </form>
      )
      }
    </Form >
  );
}
