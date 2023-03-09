import debug from 'debug';
import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import steps from '../lib/steps';
import CanvasWithStepper from '../components/CanvasWithStepper';
import Instructions from '../components/Instructions';
import Loading from '../components/Loading';
import usePrefix from '../hooks/usePrefix';
import utils from '../lib/utils';

const messages = defineMessages({
  recapDetailState0: {
    id: 'AgendaContribute.Confirmation.recapDetailState0',
    defaultMessage: 'Your event has been submitted and is being moderated. You will be notified by email when it will be published.',
  },
  recapDetailState1: {
    id: 'AgendaContribute.Confirmation.recapDetailState1',
    defaultMessage: 'Your event has been submitted and is ready to be published. You will be notified as soon as it is.',
  },
  recapDetailState2: {
    id: 'AgendaContribute.Confirmation.recapDetailState2',
    defaultMessage: 'Your event has been published and is visible on the agenda.',
  },
  seeEventAction: {
    id: 'AgendaContribute.Confirmation.seeEventAction',
    defaultMessage: 'View my event',
  },
  createOtherEvent: {
    id: 'AgendaContribute.Confirmation.createOtherEvent',
    defaultMessage: 'Add another event',
  },
  duplicateEvent: {
    id: 'AgendaContribute.Confirmation.duplicateEvent',
    defaultMessage: 'Duplicate event',
  },
  showMyEvents: {
    id: 'AgendaContribute.Confirmation.showMyEvents',
    defaultMessage: 'List all my events',
  },
  contactAdministrators: {
    id: 'AgendaContribute.Confirmation.contactAdministrators',
    defaultMessage: 'Contact the agenda administrators',
  },
});

const {
  replaceWithStep,
  doRedirect,
} = utils;

const log = debug('Confirmation');

export default function Confirmation({ history, agenda }) {
  const createdEvent = useSelector(state => state.contribute.createdEvent);
  const prefix = usePrefix(agenda);
  const res = useSelector(state => state.res);
  const location = useLocation();

  const confirmationCustomMessage = agenda.settings?.contribution?.messages?.complete;

  const {
    formatMessage: m,
  } = useIntl();

  useEffect(() => {
    if (createdEvent) {
      return;
    }
    log('  Attempting to reach confirmation screen without a created event. Redirecting to event step');
    replaceWithStep(history, location, prefix, 'event');
  }, [history, location, prefix, createdEvent]);

  if (!createdEvent) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('confirmation', { agenda })}
      onSelectStep={step => history.push(`${prefix}/${step}`)}
    >
      {confirmationCustomMessage ? (
        <Instructions message={confirmationCustomMessage} className="margin-bottom-lg" />
      ) : (
        <div className="padding-h-md padding-top-lg padding-bottom-xs wsq">
          <p className="text-center margin-bottom-xs margin-top-sm">{m(messages[`recapDetailState${createdEvent.state}`])}</p>
        </div>
      )}
      <div className="padding-all-md padding-top-sm wsq">
        <ul className="list-unstyled text-center margin-h-lg">
          <li className="margin-top-md">
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => doRedirect(
                history,
                location,
                res.showEvent
                  .replace(':agendaUid', agenda.uid)
                  .replace(':eventUid', createdEvent.uid),
              )}
            >
              {m(messages.seeEventAction)}
            </button>
          </li>
          <li className="margin-top-md">
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={() => doRedirect(history, location, prefix, { ignoreURLRedirect: true })}
            >
              {m(messages.createOtherEvent)}
            </button>
          </li>
          <li className="margin-top-md">
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={() => doRedirect(history, location, `${prefix}?eventUid=${createdEvent.uid}&agendaUid=${agenda.uid}`, { ignoreURLRedirect: true })}
            >
              {m(messages.duplicateEvent)}
            </button>
          </li>
          <li className="margin-top-md">
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={() => doRedirect(history, location, res.showMyEvents, { ignoreURLRedirect: true })}
            >
              {m(messages.showMyEvents)}
            </button>
          </li>
          <li className="margin-top-md">
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={() => doRedirect(
                history,
                location,
                res.contactAdministrators
                  .replace(':agendaUid', agenda.uid)
                  .replace(':eventUid', createdEvent.uid),
                { ignoreURLRedirect: true },
              )}
            >
              {m(messages.contactAdministrators)}
            </button>
          </li>
        </ul>
      </div>
    </CanvasWithStepper>
  );
}
