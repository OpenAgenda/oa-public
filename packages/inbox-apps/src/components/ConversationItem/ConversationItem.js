import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { MessageAvatar, Link } from '../';

export default class ConversationItem extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {
    const { conversation } = this.props;
    const { getLabel } = this.context;

    if ( !conversation.latestMessage ) {
      return null;
    }

    const { latestMessage, resolvedAt } = conversation;
    const creationDate = moment( latestMessage.createdAt );

    return (
      <div className="media">
        <div className="media-left media-top">
          <MessageAvatar message={latestMessage} />
        </div>

        <div className="media-body">
          <div className="media-heading">
            <b>{getMessageSenderName( latestMessage )}</b>{' '}
            {resolvedAt ? (<div className="tooltip-icon">
                <i className="fa fa-check" aria-hidden="true"></i>
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow"></div>
                  <div className="tooltip-inner">{getLabel( 'resolvedConversation' )}</div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="margin-bottom-xs">
            {latestMessage.body || null}
          </div>
          <p className="text-muted" title={creationDate.format( 'LLL' )}>
            {getLabel( 'messagePostedRelativeDate', { date: creationDate.fromNow( true ) } )}{' '}
            <Link
              to={`/conversation/${conversation.id}`}
              className="margin-left-xs"
            >
              {getLabel( 'viewConversation' )}
            </Link>
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
