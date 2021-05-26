import React from 'react';

import { defineMessages, useIntl } from 'react-intl';

import CheckboxComponent from './CheckboxComponent';
import SelectComponent from './SelectComponent';

const messages = defineMessages({
  syncHref: {
    id: 'LegacyEmbed.GeneralMenu.syncHref',
    defaultMessage: 'Update the browser address bar as the user navigates the calendar'
  },
  useEventSlug: {
    id: 'LegacyEmbed.GeneralMenu.useEventSlug',
    defaultMessage: 'Use slugs as event identifiers in the address bar'
  },
  standardLayout: {
    id: 'LegacyEmbed.GeneralMenu.standardLayout',
    defaultMessage: 'Standard'
  },
  tiledLayout: {
    id: 'LegacyEmbed.GeneralMenu.tiledLayout',
    defaultMessage: 'Tiled'
  },
  cascadingLayout: {
    id: 'LegacyEmbed.GeneralMenu.cascadingLayout',
    defaultMessage: 'Cascading'
  },
  noCSSLayout: {
    id: 'LegacyEmbed.GeneralMenu.noCSSLayout',
    defaultMessage: 'No CSS'
  },
  layoutPresentation: {
    id: 'LegacyEmbed.GeneralMenu.layoutPresentation',
    defaultMessage: 'List view presentation'
  }
});

export default ({
  embed,
  onChange
}) => {
  const m = useIntl().formatMessage;

  return (
    <div>
      <CheckboxComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.synchref"
        label={m(messages.syncHref)}
      />
      <CheckboxComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.use_event_slug"
        label={m(messages.useEventSlug)}
      />
      <SelectComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.layoutmode"
        options={[{
          value: 'standard',
          label: m(messages.standardLayout)
        }, {
          value: 'tiled',
          label: m(messages.tiledLayout)
        }, {
          value: 'cascading',
          label: m(messages.cascadingLayout)
        }, {
          value: 'nocss',
          label: m(messages.noCSSLayout)
        }]}
        label={m(messages.layoutPresentation)}
      />
    </div>
  );
};
