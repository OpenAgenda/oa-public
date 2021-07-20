import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useConstant } from '@openagenda/react-shared';
import { useIntl, defineMessages } from 'react-intl';
import UpdateButton from './UpdateButton';

const messages = defineMessages({
  list: {
    id: 'LegacyEmbed.EmbedSelection.list',
    defaultMessage: 'Main agenda embed'
  },
  listInfo: {
    id: 'LegacyEmbed.EmbedSelection.listInfo',
    defaultMessage: 'The embed code that integrates the main view of your calendar.'
  },
  map: {
    id: 'LegacyEmbed.EmbedSelection.map',
    defaultMessage: 'Map widget'
  },
  mapInfo: {
    id: 'LegacyEmbed.EmbedSelection.mapInfo',
    defaultMessage: 'Displays a map. This code is placed alongside the main embed'
  },
  tag: {
    id: 'LegacyEmbed.EmbedSelection.tag',
    defaultMessage: 'Choice widget'
  },
  tagInfo: {
    id: 'LegacyEmbed.EmbedSelection.tagInfo',
    defaultMessage: 'Displays a list of values. This code is placed alongside the main embed'
  },
  calendar: {
    id: 'LegacyEmbed.EmbedSelection.calendar',
    defaultMessage: 'Calendar filter'
  },
  calendarInfo: {
    id: 'LegacyEmbed.EmbedSelection.calendarInfo',
    defaultMessage: 'Displays a days-of-the-month calendar. This code is placed alongside the main embed'
  },
  search: {
    id: 'LegacyEmbed.EmbedSelection.search',
    defaultMessage: 'Search input'
  },
  searchInfo: {
    id: 'LegacyEmbed.EmbedSelection.searchInfo',
    defaultMessage: 'Displays an input to allow syntaxic searches. This code is placed alongside the main embed'
  }
});

const menus = ['list', 'map', 'tag', 'calendar', 'search'];

export default ({
  activeMenu,
  onChange,
  containerRef,
  updateRes,
  onSave,
  embed
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
      <div className="row">
        <div className="col-sm-12">
          <div className="text-center margin-v-md">
            <UpdateButton
              res={updateRes}
              onSave={onSave}
              embed={embed}
            />
          </div>
        </div>
      </div>
    </div>,
    componentElem
  );
};
