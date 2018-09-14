"use strict";

import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

export default ( { message, className } ) => message ? <div className={ className || 'wsq' }>
  <div className="event-instruction padding-all-md padding-bottom-sm">
    <ReactMarkdown source={message} />
  </div>
</div> : null;
