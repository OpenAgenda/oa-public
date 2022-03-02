import _ from 'lodash';
import React, { useContext, useState } from 'react';
import { Form, Field } from 'react-final-form';
import cn from 'classnames';
import { useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import { BasicInput } from '../utils/inputs';

function validate( values ) {
  const errors = {};

  if ( values.googleAnalytics && values.googleAnalytics.length > 255 ) {
    errors.googleAnalytics = 'string.toolong';
  }

  return errors;
}

export default function TrackingSettingsForm({ onSubmit }) {
  const { agenda } = useLayoutData();

  const { getLabel } = useContext(I18nContext);

  const [initialValues] = useState(() => ({
    googleAnalytics: _.get( agenda, 'settings.tracking.googleAnalytics', null )
  }));

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      // validate={validate}
    >
      {({ handleSubmit, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <p>{getLabel( 'statsDescription' )}</p>

          <Field
            name="googleAnalytics"
            component={BasicInput}
            type="text"
            label={getLabel( 'googleAnalyticsId' )}
            placeholder="GA_TRACKING_ID"
            className="form-control"
          />

          <button
            type="submit"
            className={cn( 'btn btn-primary', { disabled: pristine || invalid } )}
            disabled={pristine || invalid ? true : undefined}
          >
            {getLabel( 'update' )}
          </button>
        </form>
      )}
    </Form>
  );
}
