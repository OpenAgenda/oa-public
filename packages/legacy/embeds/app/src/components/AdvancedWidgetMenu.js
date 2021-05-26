import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import CheckboxComponent from './CheckboxComponent';

const messages = defineMessages({
  defaultCSS: {
    id: 'LegacyEmbed.AdvancedWidgetMenu.useDefaultCSS',
    defaultMessage: 'Use default CSS'
  }
});

export default ({
  embed,
  onChange,
  path
}) => {
  const intl = useIntl();

  return (
    <div>
      <CheckboxComponent
        embed={embed}
        onChange={onChange}
        path={path}
        label={intl.formatMessage(messages.defaultCSS)}
      />
    </div>
  );
};
