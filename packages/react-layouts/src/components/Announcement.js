import React from 'react';
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  close: {
    id: 'react-layouts.Announcement.close',
    defaultMessage: 'Close',
  },
});

const getTarget = (uri) =>
  (uri.match(/^(https?:|)\/\//) ? '_blank' : undefined);
const remarkPlugins = [breaks];

function Announcement({ kind = 'info', content, onClose }) {
  const intl = useIntl();

  return (
    <div className={`announcement bg-${kind}`}>
      <div className={`container text-${kind}`}>
        <div className="row padding-top-sm padding-right-sm padding-left-md">
          <div className="pull-right">
            <button
              type="button"
              aria-label={intl.formatMessage(messages.close)}
              className={`btn btn-link-inline text-${kind}`}
              onClick={onClose}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>

          <ReactMarkdown linkTarget={getTarget} remarkPlugins={remarkPlugins}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Announcement);
