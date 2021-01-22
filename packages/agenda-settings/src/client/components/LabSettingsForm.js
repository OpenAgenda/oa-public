import React, { useContext, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import I18nContext from '../contexts/I18nContext';

export default function LabSettingsForm({ agenda, onSubmit }) {
  const { getLabel } = useContext(I18nContext);

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={agenda.settings.lab}
    >
      {({ handleSubmit }) => (
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

          <button className="btn btn-primary" type="submit">
            {getLabel('update')}
          </button>
        </form>
      )}
    </Form>
  );
};
