import { useCallback, useContext } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Spinner, useLayoutData } from '@openagenda/react-shared';
import statusMessages from '@openagenda/common-labels/event/statuses';
import * as agendaActions from '../reducers/agenda.js';
import catchFormErrors from '../utils/catchFormErrors.js';
import I18nContext from '../contexts/I18nContext.js';

export default function StatusesForm() {
  const intl = useIntl();
  const { getLabel } = useContext(I18nContext);

  const { agenda } = useLayoutData();
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (data, form) =>
      dispatch(
        agendaActions.edit({ settings: { contribution: { status: data } } }),
      )
        .then((result) =>
          form.reset(result.agenda.settings.contribution.status))
        .catch((error) =>
          catchFormErrors(error, 'settings.contribution.status')),
    [dispatch],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={agenda.settings.contribution.status || [2, 5, 6]}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Field
            name="enabled"
            value={2}
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  <p>
                    <b>{intl.formatMessage(statusMessages.rescheduled)}</b>
                    <br />
                    <span className="text-muted">
                      {intl.formatMessage(statusMessages.rescheduledInfo)}
                    </span>
                  </p>
                </label>
              </div>
            )}
          />

          <Field
            name="enabled"
            value={3}
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  <p>
                    <b>{intl.formatMessage(statusMessages.movedOnline)}</b>
                    <br />
                    <span className="text-muted">
                      {intl.formatMessage(statusMessages.movedOnlineInfo)}
                    </span>
                  </p>
                </label>
              </div>
            )}
          />

          <Field
            name="enabled"
            value={4}
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  <p>
                    <b>{intl.formatMessage(statusMessages.postponed)}</b>
                    <br />
                    <span className="text-muted">
                      {intl.formatMessage(statusMessages.postponedInfo)}
                    </span>
                  </p>
                </label>
              </div>
            )}
          />

          <Field
            name="enabled"
            value={5}
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  <p>
                    <b>{intl.formatMessage(statusMessages.full)}</b>
                    <br />
                    <span className="text-muted">
                      {intl.formatMessage(statusMessages.fullInfo)}
                    </span>
                  </p>
                </label>
              </div>
            )}
          />

          <Field
            name="enabled"
            value={6}
            type="checkbox"
            render={({ input }) => (
              <div className="checkbox">
                <label>
                  <input {...input} />
                  <p>
                    <b>{intl.formatMessage(statusMessages.cancelled)}</b>
                    <br />
                    <span className="text-muted">
                      {intl.formatMessage(statusMessages.cancelledInfo)}
                    </span>
                  </p>
                </label>
              </div>
            )}
          />

          <div className="margin-bottom-md">
            <a
              href="https://doc.openagenda.com/fr/article/indiquer-quun-evenement-est-complet-annule-ou-reporte-v2m1pu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {getLabel('learnMore')}
            </a>
          </div>

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
