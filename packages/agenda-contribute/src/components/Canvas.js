import { defineMessages, useIntl } from 'react-intl';

import getEventTitle from '../lib/getEventTitle';

const messages = defineMessages({
  shareEvent: {
    id: 'AgendaContribute.Canvas.shareEvent',
    defaultMessage: 'Share an event',
  },
  takeEvent: {
    id: 'AgendaContribute.Canvas.takeEvent',
    defaultMessage: 'Take',
  },
  fromAgenda: {
    id: 'AgendaContribute.Canvas.fromAgenda',
    defaultMessage: 'from the agenda',
  },
  toAgenda: {
    id: 'AgendaContribute.Canvas.toAgenda',
    defaultMessage: 'to the agenda',
  },
});

function AddHeader({ event, fromAgenda, agenda }) {
  const intl = useIntl();

  const {
    formatMessage: m,
    locale,
  } = intl;

  return (
    <div className="margin-v-lg">
      <h3 className="margin-bottom-md">{m(messages.shareEvent)}</h3>
      <div className="margin-v-md">
        <p>{m(messages.takeEvent)} <strong>{getEventTitle(event, locale)}</strong></p>
        <p>{m(messages.fromAgenda)} <a rel="noreferrer" target="_blank" href={`/agendas/${fromAgenda.uid}`}><span>{fromAgenda.title}</span></a></p>
        <p>{m(messages.toAgenda)} <a rel="noreferrer" target="_blank" href={`/agendas/${agenda.uid}`}><span>{agenda.title}</span></a></p>
      </div>
    </div>
  );
}

function EditHeader({ event }) {
  const { locale } = useIntl();

  return (
    <div className="margin-v-lg">
      <h3>{getEventTitle(event, locale)}</h3>
    </div>
  );
}

function Header(props) {
  const {
    mode,
  } = props;

  if (mode === 'share') {
    return <AddHeader {...props} />;
  }

  if (mode === 'edit') {
    return <EditHeader {...props} />;
  }

  return null;
}

export default function Canvas(props) {
  const {
    children,
  } = props;

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
          <div className="text-center">
            <Header {...props} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
