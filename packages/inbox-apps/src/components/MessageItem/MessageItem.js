import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { AuthorAvatar } from '../';

export default class MessageItem extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {
    const { message } = this.props;
    const { getLabel } = this.context;

    if ( !message ) {
      return null;
    }

    const creationDate = moment( message.createdAt );

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={message} />
        </div>

        <div className="media-body">
          <p className="media-heading">
            <b>{getMessageSenderName( message )}</b>
          </p>
          <div className="margin-bottom-xs">
            {message.body || null}
          </div>
          <p className="text-muted" title={creationDate.format( 'LLL' )}>
            {getLabel( 'messagePostedRelativeDate', { date: creationDate.fromNow( true ) } )}
          </p>
        </div>
      </div>
    );
  }
}

function getMessageSenderName( message ) {
  if ( message.inboxUser ) {
    return message.inboxUser.name;
  }

  return message.inbox.name;
}
