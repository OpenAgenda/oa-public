import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import InputComponent from './InputComponent';
import CheckboxComponent from './CheckboxComponent';

const messages = defineMessages({
  facebookAppId: {
    id: 'LegacyEmbed.ShareMenu.facebookAppId',
    defaultMessage: 'Your website\'s Facebook app identifier'
  },
  facebookAppIdSub: {
    id: 'LegacyEmbed.ShareMenu.facebookAppIdSub',
    defaultMessage: 'Required to share events on Facebook with links pointing on your website'
  },
  siteURL: {
    id: 'LegacyEmbed.ShareMenu.siteURL',
    defaultMessage: 'Use the URL of your website in share links (activate the url update option)'
  }
});

const shares = [{
  key: 'fb',
  label: 'Facebook',
  path: 'config.layout.shares.fb'
}, {
  key: 'tw',
  label: 'Twitter',
  path: 'config.layout.shares.tw'
}, {
  key: 'li',
  label: 'LinkedIn',
  path: 'config.layout.shares.li'
}, {
  key: 'pi',
  label: 'Pinterest',
  path: 'config.layout.shares.pi'
}, {
  key: 'em',
  label: 'Email',
  path: 'config.layout.shares.em'
}];

export default ({
  embed,
  onChange
}) => {
  const m = useIntl().formatMessage;

  return (
    <div>
      {shares.map(s => (<CheckboxComponent embed={embed} onChange={onChange} {...s} />))}
      <InputComponent
        embed={embed}
        type="text"
        label={m(messages.facebookAppId)}
        path="config.facebookappid"
        sub={m(messages.facebookAppIdSub)}
        onChange={onChange}
      />
      <InputComponent
        embed={embed}
        type="'url"
        label={m(messages.siteURL)}
        path="config.siteurl"
        onChange={onChange}
      />
    </div>
  );
};
