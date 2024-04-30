import { Component, Fragment } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import { fromMarkdownToHTML } from '@openagenda/md';
import qs from 'qs';
import I18nContext from '../contexts/I18nContext';
import getDestinationInbox from '../utils/getDestinationInbox';
import AuthorAvatar from './AuthorAvatar';
import ConversationTitle from './ConversationTitle';
import Link from './Link';

const getInboxUserName = entity => entity.inboxUser?.name ?? entity.inbox.name;

function isCreator(creator, user) {
  if (creator.inboxUser?.userUid === user.uid) {
    return true;
  }

  if (creator.inbox.type === 'user' && creator.inbox.identifier === user.uid) {
    return true;
  }

  return false;
}

@connect(
  state => ({
    settings: state.settings,
  }),
)
export default class ConversationItem extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.TitleEntityComponent = this.TitleEntityComponent.bind(this);
  }

  TitleEntityComponent({ children, type, agendaUid, eventUid, locationUid }) {
    const { agenda, settings: { context } } = this.props;

    switch (type) {
      case 'agenda':
        return <Link to={`/agendas/${agendaUid}`} agenda={agenda} external>{children}</Link>;
      case 'event':
        return <Link to={`/agendas/${agendaUid}/events/${eventUid}`} agenda={agenda} external>{children}</Link>;
      case 'location':
        if (context === 'agenda') {
          return (
            <Link
              to={`/agendas/${agendaUid}/admin/locations?uids[]=${locationUid}`}
              className="conversation-title-entity"
              agenda={agenda}
              external
            >
              {children}
            </Link>
          );
        }
        return;
      default:
        return <b>{children}</b>;
    }
  }

  renderAuthorSentence({ destinationInbox }) {
    const { user, conversation } = this.props;
    const { getLabel, lang } = this.context;
    const { latestMessage } = conversation;

    const creationDate = moment(latestMessage.createdAt).locale(lang);
    const firstMessage = creationDate.diff(moment(conversation.createdAt), 'seconds') <= 2;
    const creator = {
      inbox: conversation.latestMessage && conversation.latestMessage.inbox
        ? conversation.latestMessage.inbox
        : null,
      inboxUser: conversation.latestMessage && conversation.latestMessage.inboxUser
        ? conversation.latestMessage.inboxUser
        : null,
    };

    if (firstMessage) {
      return (
        <div className="margin-bottom-sm padding-top-xs text-muted" title={creationDate.format('LLL')}>
          {getLabel('postedAgo', { date: creationDate.fromNow(true) })}
        </div>
      );
    }
    if (isCreator(creator, user)) {
      return (
        <div className="margin-bottom-sm padding-top-xs text-muted" title={creationDate.format('LLL')}>
          {getLabel('youRepliedAgo', { date: creationDate.fromNow(true) })}
        </div>
      );
    }
    return (
      <div
        className={cn(
          'margin-bottom-sm',
          'text-muted',
          { 'padding-top-xs': destinationInbox.id === latestMessage.inbox.id },
        )}
        title={creationDate.format('LLL')}
      >
        {destinationInbox.id !== latestMessage.inbox.id
          ? (
            <>
              <AuthorAvatar author={latestMessage} inline />{' '}
            </>
          )
          : null}
        {getInboxUserName(latestMessage)}{' '}
        {getLabel('repliedAgo', { date: creationDate.fromNow(true) })}
      </div>
    );
  }

  renderAttachments(attachments) {
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
            <Fragment key={attachment.id}>
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
            </Fragment>
          );
        })}
      </div>
    );
  }

  render() {
    const { user, conversation, agenda, settings: { domain } } = this.props;
    const { getLabel } = this.context;

    if (!conversation.latestMessage) {
      return null;
    }

    const { latestMessage, resolvedAt } = conversation;

    const destinationInbox = getDestinationInbox({ user, conversation });

    const resolvedIcon = resolvedAt ? (
      <>
        {' '}
        <div className="tooltip-icon">
          <i className="fa fa-check" aria-hidden="true" />
          <div className="tooltip right" role="tooltip">
            <div className="tooltip-arrow" />
            <div className="tooltip-inner">{getLabel('resolvedConversation')}</div>
          </div>
        </div>
      </>
    ) : null;

    const origin = conversation.store?.params?.origin
      ? decodeURIComponent(conversation.store.params.origin)
      : null;

    return (
      <div className="media conversation-item">
        <div className="media-left media-top">
          {destinationInbox && (
            <AuthorAvatar author={{ inbox: destinationInbox }} />
          )}
        </div>

        <div className="media-body">
          <div className="media-heading margin-bottom-sm">
            <ConversationTitle
              user={user}
              conversation={conversation}
              EntityComponent={this.TitleEntityComponent}
            />
            {resolvedIcon}

            {origin ? (
              <div className="text-muted">
                ({getLabel('from')} <em><a href={origin} target="_blank" rel="noreferrer">{origin}</a></em>)
              </div>
            ) : null}
          </div>

          <div className="conversation-item-message margin-bottom-sm">
            {this.renderAuthorSentence({ destinationInbox })}

            <div
              className="message padding-bottom-xs"
              dangerouslySetInnerHTML={{
                __html: fromMarkdownToHTML(latestMessage.body, { selfDomain: domain }),
              }}
            />

            {this.renderAttachments(latestMessage.attachments)}
          </div>

          <Link to={`/conversation/${conversation.id}`} agenda={agenda}>
            {getLabel('viewConversation')}
          </Link>
        </div>
      </div>
    );
  }
}
