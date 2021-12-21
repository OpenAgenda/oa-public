import React, { useContext } from 'react';
import { Form, Field } from 'react-final-form';
import I18nContext from '../contexts/I18nContext';
import { Spinner } from '@openagenda/react-shared';

export default function LabSettingsForm({ agenda, onSubmit }) {
  const { getLabel } = useContext(I18nContext);

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
