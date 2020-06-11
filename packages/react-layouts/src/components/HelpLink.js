import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  help: {
    id: 'react-layouts.MainLayout.help',
    defaultMessage: 'Help'
  }
});

function HelpLink() {
  const intl = useIntl();

  return (
    <div className="help-button-canvas">
      <a
        className="btn btn-primary btn-rounded btn-bordered"
        rel="nofollow"
        target="_blank"
        href="/support"
      >
        <i className="fa fa-question-circle" />{' '}
        <span>{intl.formatMessage(messages.help)}</span>
      </a>
    </div>
  );
}

export default React.memo(HelpLink);
