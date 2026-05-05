import { http, HttpResponse, delay } from 'msw';
import { screen, userEvent } from 'storybook/test';
import fetchLocale from 'app/locales';
import RemoveEventModal from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/ContextBar/RemoveEventModal';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';

const AGENDA_UID = 123;
const EVENT_UID = 456;
const DELETE_URL = `/api/agendas/${AGENDA_UID}/events/${EVENT_UID}`;

const noop = () => {};

const defaultArgs = {
  isOpen: true,
  onClose: noop,
  agendaUid: AGENDA_UID,
  eventUid: EVENT_UID,
  isOriginAgenda: false,
  onCompleted: noop,
};

export default {
  title: 'components/EventShow/RemoveEventModal',
  component: RemoveEventModal,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [ProvidersDecorator],
};

async function clickConfirm() {
  const confirmButton = await screen.findByRole('button', {
    name: /^(Retirer|Supprimer)$/,
  });
  await userEvent.click(confirmButton);
}

export function Idle() {
  return <RemoveEventModal {...defaultArgs} />;
}

Idle.parameters = {
  msw: {
    handlers: [http.delete(DELETE_URL, () => HttpResponse.json({}))],
  },
};

export function Loading() {
  return <RemoveEventModal {...defaultArgs} />;
}

Loading.parameters = {
  msw: {
    handlers: [
      http.delete(DELETE_URL, async () => {
        await delay(60_000);
        return HttpResponse.json({});
      }),
    ],
  },
};

Loading.play = async () => {
  await clickConfirm();
};

export function Success() {
  return <RemoveEventModal {...defaultArgs} />;
}

Success.parameters = {
  msw: {
    handlers: [http.delete(DELETE_URL, () => HttpResponse.json({}))],
  },
};

Success.play = async () => {
  await clickConfirm();
};

export function DeleteSuccess() {
  return <RemoveEventModal {...defaultArgs} isOriginAgenda />;
}

DeleteSuccess.parameters = Success.parameters;

DeleteSuccess.play = async () => {
  await clickConfirm();
};

export function Error404() {
  return <RemoveEventModal {...defaultArgs} />;
}

Error404.parameters = {
  msw: {
    handlers: [
      http.delete(DELETE_URL, () => new HttpResponse(null, { status: 404 })),
    ],
  },
};

Error404.play = async () => {
  await clickConfirm();
};

export function Error500() {
  return <RemoveEventModal {...defaultArgs} />;
}

Error500.parameters = {
  msw: {
    handlers: [
      http.delete(DELETE_URL, () => new HttpResponse(null, { status: 500 })),
    ],
  },
};

Error500.play = async () => {
  await clickConfirm();
};
