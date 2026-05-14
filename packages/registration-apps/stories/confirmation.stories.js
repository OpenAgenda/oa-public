import Confirmation from '../src/passCulture/Confirmation.js';
import event from './fixtures/event.json' with { type: 'json' };

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Confimation',
};

export function ConfimationSuccess() {
  return (
    <Confirmation
      event={{
        ...event,
        registration: [
          {
            type: 'link',
            value: 'https://link.pass.com',
            service: 'passCulture',
            data: {
              eventOffer: {
                id: 123,
              },
            },
          },
        ],
      }}
      res={{
        edit: 'https://integration.passculture.pro/offre/individuelle/:id/recapitulatif',
        show: 'https://integration.passculture.app/offre/:id',
      }}
    />
  );
}

export function ConfimationPending() {
  return (
    <Confirmation
      event={{
        ...event,
        registration: [
          {
            type: 'link',
            value: 'https://link.pass.com',
            service: 'passCulture',
            data: [
              {
                eventOffer: {
                  id: 123,
                },
                response: {
                  isPending: true,
                },
              },
            ],
          },
        ],
      }}
      res={{
        edit: 'https://integration.passculture.pro/offre/individuelle/:id/recapitulatif',
        show: 'https://integration.passculture.app/offre/:id',
      }}
    />
  );
}

export function ConfirmationFailure() {
  return (
    <Confirmation
      event={{
        ...event,
        registration: [
          {
            type: 'link',
            value: 'https://link.pass.com',
            service: 'passCulture',
            data: {
              id: 123,
              errors: [
                {
                  message: 'failed to create all dates',
                  fieldLabel: 'Pass Culture',
                  code: 'registration.pass.invalidDate.quantity',
                  label:
                    "Certaines dates n'ont pas pu être créées: les quantités saisies doivent être des entiers positifs",
                },
              ],
            },
          },
        ],
      }}
      res={{
        edit: 'https://integration.passculture.pro/offre/individuelle/:id/recapitulatif',
        show: 'https://integration.passculture.app/offre/:id',
      }}
    />
  );
}

export function ConfirmationWaitingOnPublish() {
  return (
    <Confirmation
      event={{
        ...event,
        state: 0,
        registration: [
          {
            type: 'link',
            value: 'https://link.pass.com',
            service: 'passCulture',
            data: [{}],
          },
        ],
      }}
      res={{
        edit: 'https://integration.passculture.pro/offre/individuelle/:id/recapitulatif',
        show: 'https://integration.passculture.app/offre/:id',
      }}
    />
  );
}
