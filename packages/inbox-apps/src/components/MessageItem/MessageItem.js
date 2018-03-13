import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import marked from 'marked';
import qs from 'qs';
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

    const attachment = message.attachments.length ? message.attachments[ 0 ] : null;

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={message}/>
        </div>

        <div className="media-body">
          <p className="media-heading">
            <b>{getMessageSenderName( message )}</b>
          </p>
          <div className="conversation-item-message">
            <div
              className="margin-bottom-xs"
              dangerouslySetInnerHTML={{ __html: marked( message.body, { breaks: true } ) }}
            />
            {attachment && (
              <div>
                <i className="fa fa-paperclip" aria-hidden="true"></i>{' '}
                {getLabel( 'attachment' )}:{' '}
                <a
                  href={`/home/inbox/download-attachment?${qs.stringify( {
                    filename: attachment.filename,
                    id: attachment.id
                  } )}`}
                  target="_blank"
                  download={attachment.originalName}
                >
                  {attachment.originalName}
                </a>
              </div>
            )}
            <p className="text-muted" title={creationDate.format( 'LLL' )}>
              {getLabel( 'messagePostedRelativeDate', { date: creationDate.fromNow( true ) } )}
            </p>
          </div>
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
