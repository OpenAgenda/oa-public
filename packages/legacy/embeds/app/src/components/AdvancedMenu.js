import React from 'react';

import { defineMessages, useIntl } from 'react-intl';

import CheckboxComponent from './CheckboxComponent';
import InputComponent from './InputComponent';

const messages = defineMessages({
  autoScroll: {
    id: 'LegacyEmbed.AdvancedMenu.autoScroll',
    defaultMessage: 'Load events automatically when the bottom of the list is reached'
  },
  linkCSS: {
    id: 'LegacyEmbed.AdvancedMenu.linkCSS',
    defaultMessage: 'Add a link to a stylesheet'
  },
  customCSS: {
    id: 'LegacyEmbed.AdvancedMenu.customCSS',
    defaultMessage: 'Type in your css'
  },
  customHead: {
    id: 'LegacyEmbed.AdvancedMenu.customHead',
    defaultMessage: 'Custom &lt;head&gt; segment'
  },
  customListHead: {
    id: 'LegacyEmbed.AdvancedMenu.customListHead',
    defaultMessage: 'Custom list head template'
  },
  customListItem: {
    id: 'LegacyEmbed.AdvancedMenu.customListItem',
    defaultMessage: 'Custom list item template'
  },
  customEvent: {
    id: 'LegacyEmbed.AdvancedMenu.customEvent',
    defaultMessage: 'Custom event page template'
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
        path="config.layout.autoscroll"
        label={m(messages.autoScroll)}
      />
      <InputComponent
        embed={embed}
        onChange={onChange}
        type="url"
        path="config.layout.linkcss"
        label={m(messages.linkCSS)}
      />
      <InputComponent
        embed={embed}
        onChange={onChange}
        type="textarea"
        path="config.layout.customcss"
        label={m(messages.customCSS)}
        rows={10}
      />
      <InputComponent
        embed={embed}
        onChange={onChange}
        type="textarea"
        path="config.head"
        label={m(messages.customHead)}
        rows={10}
      />
      <InputComponent
        embed={embed}
        onChange={onChange}
        type="textarea"
        path="template.header"
        label={m(messages.customListHead)}
        rows={10}
      />
      <InputComponent
        embed={embed}
        onChange={onChange}
        type="textarea"
        rows={10}
        path="template.eventitem"
        label={m(messages.customListItem)}
      />
      <InputComponent
        embed={embed}
        onChange={onChange}
        type="textarea"
        rows={10}
        path="template.eventitem"
        label={m(messages.customEvent)}
      />
    </div>
  );
};
