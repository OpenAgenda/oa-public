import React, { Component } from 'react';
import moment from 'moment';
import { fromMarkdownToHTML } from '@openagenda/md';
import qs from 'qs';
import I18nContext from '../contexts/I18nContext';
import AuthorAvatar from './AuthorAvatar';
import DisplaySenderContext from './DisplaySenderContext';

const getMessageSenderName = message => message.inboxUser?.name ?? message.inbox.name;

const getContextLink = (message, contextRes) => contextRes && (
  message.inbox.type === 'user'
) && contextRes.replace(':identifier', message.inbox.identifier);

export default class MessageItem extends Component {
  static contextType = I18nContext;

  renderAttachments() {
    const { message: { attachments } } = this.props;
    const { getLabel } = this.context;

    if (!attachments || !attachments.length) {
      return null;
    }

    return (
      <div>
        <i className="fa fa-paperclip" aria-hidden="true" />{' '}
        {getLabel(attachments && attachments.length > 1 ? 'attachments' : 'attachment')}:

        {attachments.map((attachment, i) => {
          const isImage = /\.(jpeg|jpg|gif|png|svg|bmp)$/i.test(attachment.filename);
          const link = `/home/inbox/download-attachment?${qs.stringify({
            filename: attachment.filename,
            id: attachment.id,
          })}`;

          return (
            <React.Fragment key={attachment.id}>
              {i === 0 ? ' ' : ', '}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                {...(isImage ? {} : { download: attachment.originalName })}
              >
                {isImage
                  ? <img src={link} alt={attachment.filename} className="attachment-image" /> : attachment.originalName}
              </a>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  render() {
    const { message, res: { context: contextRes }, domain } = this.props;
    const { getLabel, lang } = this.context;

    if (!message) {
      return null;
    }

    const creationDate = moment(message.createdAt).locale(lang);

    const contextLink = getContextLink(message, contextRes);

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={message} />
        </div>

        <div className="media-body">
          <div className="media-heading">
            <b>{getMessageSenderName(message)}</b>
            {contextLink ? <DisplaySenderContext res={contextLink} lang={lang} /> : null}
          </div>
          <div className="conversation-item-message">
            <div
              className="margin-bottom-xs"
              dangerouslySetInnerHTML={{
                __html: fromMarkdownToHTML(message.body, { selfDomain: domain }),
              }}
            />

            {this.renderAttachments()}

            <p className="text-muted" title={creationDate.format('LLL')}>
              {getLabel('messagePostedRelativeDate', { date: creationDate.fromNow(true) })}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
