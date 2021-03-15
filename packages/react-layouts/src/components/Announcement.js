import React from 'react';
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';

const getTarget = uri => (uri.match(/^(https?:|)\/\//) ? '_blank' : undefined);
const reactMdPlugins = [breaks];

function Announcement({ kind = 'info', content, onClose }) {
  return (
    <div className={`announcement bg-${kind}`}>
      <div className={`container text-${kind}`}>
        <div className="row padding-top-sm padding-right-sm padding-left-md">
          <div className="pull-right">
            <button
              type="button"
              className={`btn btn-link-inline text-${kind}`}
              onClick={onClose}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>

          <ReactMarkdown
            linkTarget={getTarget}
            source={content}
            plugins={reactMdPlugins}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(Announcement);
