import { useCallback, useContext } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { Spinner, useLayoutData } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext.js';
import * as agendaActions from '../reducers/agenda.js';
import catchFormErrors from '../utils/catchFormErrors.js';

export default function LabSettingsForm() {
  const { agenda } = useLayoutData();
  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (data, form) =>
      dispatch(agendaActions.edit({ settings: { lab: data } }))
        .then((result) => form.reset(result.agenda.settings.lab))
        .catch((error) => catchFormErrors(error, 'settings.lab')),
    [dispatch],
  );

  return (
    <Form onSubmit={onSubmit} initialValues={agenda.settings.lab}>
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Field
            name="status"
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  {getLabel('eventStatusDesc')}
                  <br />
                  <a
                    target="_blank"
                    href="https://doc.openagenda.com/les-etats-dun-evenement/"
                    rel="noreferrer"
                  >
                    En savoir plus
                  </a>
                </label>
              </div>
            )}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={submitting}
          >
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
}
