import React, { useCallback, useContext } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import I18nContext from '../contexts/I18nContext';
import { Spinner, useLayoutData } from '@openagenda/react-shared';
import * as agendaActions from '../reducers/agenda';
import catchFormErrors from '../utils/catchFormErrors';

export default function LabSettingsForm() {
  const { agenda } = useLayoutData();
  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (data, form) => dispatch(agendaActions.edit({ settings: { lab: data } }))
      .then(result => form.reset(result.data.agenda.settings.lab))
      .catch(error => catchFormErrors(error, 'settings.lab')),
    [dispatch]
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={agenda.settings.lab}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Field
            name="eventAdmin"
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  {getLabel('eventAdminDesc')}
                </label>
              </div>
            )}
          />
          <Field
            name="status"
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  {getLabel('eventStatusDesc')}
                </label>
              </div>
            )}
          />
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {getLabel('update')}

            {submitting ? (
              <span className="margin-left-xs">
                <Spinner mode="inline" />
              </span>
            ) : null}
          </button>
        </form>
      )}
    </Form>
  );
};
