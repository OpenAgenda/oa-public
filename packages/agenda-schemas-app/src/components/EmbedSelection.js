import { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useConstant } from '@openagenda/react-shared';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  event: {
    id: 'AgendaSchema.EmbedSelection.events',
    defaultMessage: 'Events',
  },
  eventInfo: {
    id: 'AgendaSchema.EmbedSelection.eventInfo',
    defaultMessage: 'Events configuration',
  },
  member: {
    id: 'AgendaSchema.EmbedSelection.members',
    defaultMessage: 'Members',
  },
  memberInfo: {
    id: 'AgendaSchema.EmbedSelection.memberInfo',
    defaultMessage: 'Members configuration. Add, remove, change order of member fields.',
  },
  memberInfoAsk: {
    id: 'AgendaSchema.EmbedSelection.memberInfoAsk',
    defaultMessage: 'Ask for activation',
  },
  notActivated: {
    id: 'AgendaSchema.EmbedSelection.notActivated',
    defaultMessage: 'This feature is not activated on your agenda',
  },
});

export default ({
  activeMenu,
  onChange,
  containerRef,
  memberCredential,
}) => {
  const m = useIntl().formatMessage;

  const componentElem = useConstant(() => document.createElement('div'));

  useLayoutEffect(() => {
    const containerElem = containerRef.current;

    containerElem.appendChild(componentElem);

    return () => containerElem.removeChild(componentElem);
  }, [componentElem, containerRef]);

  return ReactDOM.createPortal(
    <div className="padding-h-sm padding-v-xs wsq">
      <div className="row">
        <div className="col-sm-12">
          <div className="radio" key="event">
            <label htmlFor="event">
              <input
                id="event"
                type="radio"
                checked={activeMenu === 'event'}
                onChange={onChange.bind(null, 'event')}
              />
              {m(messages.event)}

              <div className="text-muted">{m(messages.eventInfo)}</div>
            </label>
          </div>
          <div className="radio" key="member">
            <label htmlFor="member">
              <input
                id="member"
                type="radio"
                disabled={!memberCredential}
                checked={activeMenu === 'member'}
                onChange={onChange.bind(null, 'member')}
              />
              {m(messages.member)}
              <div className="text-muted">{m(messages.memberInfo)}</div>
              {!memberCredential
                ? (
                  <div className="text-muted">
                    <p>{m(messages.notActivated)}</p>
                    <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=memberSchema`}> {m(messages.memberInfoAsk)}</a>
                  </div>
                )
                : null}
            </label>
          </div>
        </div>
      </div>
    </div>,
    componentElem,
  );
};
