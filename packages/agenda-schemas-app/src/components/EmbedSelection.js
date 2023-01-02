import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useConstant } from '@openagenda/react-shared';
import { useIntl, defineMessages } from 'react-intl';
// import UpdateButton from './UpdateButton';

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
    defaultMessage: 'Members configuration',
  },
});

const menus = ['event', 'member'];

export default ({
  activeMenu,
  onChange,
  containerRef,
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
          {menus.map(menu => (
            <div className="radio" key={menu}>
              <label htmlFor={menu}>
                <input
                  id={menu}
                  type="radio"
                  checked={menu === activeMenu}
                  onChange={onChange.bind(null, menu)}
                />
                {m(messages[menu])}
                <div className="text-muted">{m(messages[`${menu}Info`])}</div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>,
    componentElem,
  );
};
