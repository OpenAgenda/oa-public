import React from 'react';
import ReactMarkdown from 'react-markdown';

export default ( { message, className, boxed } ) => message ? <div className={ className || 'wsq' }>
  <div className="event-instruction padding-all-md padding-bottom-sm boxed">
    <ReactMarkdown>{message}</ReactMarkdown>
  </div>
</div> : null;
