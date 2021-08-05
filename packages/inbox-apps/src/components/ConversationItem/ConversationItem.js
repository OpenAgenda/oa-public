import React, { Component, Fragment } from 'react';
import cn from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import marked from 'marked';
import qs from 'qs';
import { AuthorAvatar, ConversationTitle, Link, LinkContainer } from '../';
import I18nContext from '../../contexts/I18nContext';
import getDestinationInbox from '../../utils/getDestinationInbox';

@connect(
  state => ({
    settings: state.settings
  })
)
export default class ConversationItem extends Component {
  constructor( props ) {
    super( props );
    this.TitleEntityComponent = ::this.TitleEntityComponent;
  }

  static contextType = I18nContext;

  renderAuthorSentence( { destinationInbox } ) {
    const { user, conversation } = this.props;
    const { getLabel, lang } = this.context;
    const { latestMessage } = conversation;

    const creationDate = moment( latestMessage.createdAt ).locale(lang);
    const firstMessage = creationDate.diff( moment( conversation.createdAt ), 'seconds' ) <= 2;
    const creator = {
      inbox: conversation.latestMessage && conversation.latestMessage.inbox
        ? conversation.latestMessage.inbox
        : null,
      inboxUser: conversation.latestMessage && conversation.latestMessage.inboxUser
        ? conversation.latestMessage.inboxUser
        : null
    };

    if ( firstMessage ) {
      return (
        <div className="margin-bottom-sm padding-top-xs text-muted" title={creationDate.format( 'LLL' )}>
          {getLabel( 'postedAgo', { date: creationDate.fromNow( true ) } )}
        </div>
      );
    } else {
      if ( isCreator( creator, user ) ) {
        return (
          <div className="margin-bottom-sm padding-top-xs text-muted" title={creationDate.format( 'LLL' )}>
            {getLabel( 'youRepliedAgo', { date: creationDate.fromNow( true ) } )}
          </div>
        );
      } else {
        return (
          <div
            className={cn(
              'margin-bottom-sm',
              'text-muted',
              { 'padding-top-xs': destinationInbox.id === latestMessage.inbox.id }
            )}
            title={creationDate.format( 'LLL' )}
          >
            {destinationInbox.id !== latestMessage.inbox.id
              ? (
                <Fragment>
                  <AuthorAvatar author={latestMessage} inline />{' '}
                </Fragment>
              )
              : null}
            {getInboxUserName( latestMessage )}{' '}
            {getLabel( 'repliedAgo', { date: creationDate.fromNow( true ) } )}
          </div>
        );
      }
    }
  }

  TitleEntityComponent( { children, type, agendaUid, eventUid, locationUid } ) {
    const { agenda } = this.props;
    const { context } = this.props.settings;

    switch ( type ) {
      case 'agenda':
        return <Link to={`/agendas/${agendaUid}`} agenda={agenda} external>{children}</Link>;
      case 'event':
        return <Link to={`/agendas/${agendaUid}/events/${eventUid}`} agenda={agenda} external>{children}</Link>;
      case 'location':
        if ( context === 'agenda' ) {
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
      default:
        return <b>{children}</b>;
    }
  }

  renderAttachments( attachments ) {
    const { getLabel } = this.context;

    if ( !attachments || !attachments.length ) {
      return null;
    }

    return (
      <div>
        <i className="fa fa-paperclip" aria-hidden="true"></i>{' '}
        {getLabel( attachments && attachments.length > 1 ? 'attachments' : 'attachment' )}:

        {attachments.map( ( attachment, i ) => {
          const isImage = /\.(jpeg|jpg|gif|png|svg|bmp)$/i.test( attachment.filename );
          const link = `/home/inbox/download-attachment?${qs.stringify( {
            filename: attachment.filename,
            id: attachment.id
          } )}`;

          return (
            <Fragment key={attachment.id}>
              {i === 0 ? ' ' : ', '}
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                {...(isImage ? {} : { download: attachment.originalName })}
              >
                {isImage ?
                  <img src={link} alt={attachment.filename} className="attachment-image" /> : attachment.originalName}
              </a>
            </Fragment>
          );
        } )}
      </div>
    );

    return;
  }

  render() {
    const { user, conversation, agenda } = this.props;
    const { getLabel } = this.context;

    if ( !conversation.latestMessage ) {
      return null;
    }

    const { latestMessage, resolvedAt } = conversation;

    const destinationInbox = getDestinationInbox( { user, conversation } );

    const resolvedIcon = resolvedAt ? <Fragment>
      {' '}
      <div className="tooltip-icon">
        <i className="fa fa-check" aria-hidden="true"></i>
        <div className="tooltip right" role="tooltip">
          <div className="tooltip-arrow"></div>
          <div className="tooltip-inner">{getLabel( 'resolvedConversation' )}</div>
        </div>
      </div>
    </Fragment> : null;

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

            {conversation.store?.params?.origin ? (
              <div className="text-muted">
                ({getLabel( 'from' )} <em>{decodeURIComponent( conversation.store.params.origin )})</em>
              </div>
            ) : null}
          </div>

          <div className="conversation-item-message margin-bottom-sm">
            {this.renderAuthorSentence( { destinationInbox } )}

            <div
              className="message padding-bottom-xs"
              dangerouslySetInnerHTML={{
                __html: marked( latestMessage.body, {
                  breaks: true,
                  sanitize: true,
                  pedantic: true
                } )
              }}
            />

            {this.renderAttachments( latestMessage.attachments )}
          </div>

          <Link to={`/conversation/${conversation.id}`} agenda={agenda}>
            {getLabel( 'viewConversation' )}
          </Link>
        </div>
      </div>
    );
  }
}

function getInboxUserName( entity ) {
  if ( entity.inboxUser ) {
    return entity.inboxUser.name;
  }

  return entity.inbox.name;
}

function isCreator( creator, user ) {
  if ( creator.inboxUser && creator.inboxUser.userUid === user.uid ) {
    return true;
  }

  if ( creator.inbox.type === 'user' && creator.inbox.identifier === user.uid ) {
    return true;
  }

  return false;
}
