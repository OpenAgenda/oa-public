import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import nl2br from '@openagenda/react-utils/dist/nl2br';
import { AuthorAvatar, ConversationTitle, Link } from '../';
import getDestinationInbox from '../../utils/getDestinationInbox';

@connect(
  state => ({
    settings: state.settings
  })
)
export default class ConversationItem extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderAuthorSentence( { destinationInbox } ) {
    const { getLabel } = this.context;
    const { user, conversation } = this.props;
    const { latestMessage } = conversation;

    const creationDate = moment( latestMessage.createdAt );
    const firstMessage = creationDate.diff( moment( conversation.createdAt ), 'seconds' ) <= 1;
    const creator = {
      inbox: conversation.creatorInbox,
      inboxUser: conversation.creatorInboxUser
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
                  <AuthorAvatar author={latestMessage} inline/>{' '}
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

  TitleEntityComponent( { children, type, agendaUid, eventUid } ) {
    switch ( type ) {
      case 'agenda':
        return <Link to={`/agendas/${agendaUid}`} external>{children}</Link>;
      case 'event':
        return <Link to={`/agendas/${agendaUid}/events/${eventUid}`} external>{children}</Link>;
      default:
        return <b>{children}</b>;
    }
  }

  render() {
    const { user, conversation } = this.props;
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
          <AuthorAvatar author={{ inbox: destinationInbox }}/>
        </div>

        <div className="media-body">
          <div className="media-heading margin-bottom-sm">
            <ConversationTitle
              user={user}
              conversation={conversation}
              EntityComponent={this.TitleEntityComponent}
            />
            {resolvedIcon}
          </div>

          <div className="conversation-item-message margin-bottom-sm">
            {this.renderAuthorSentence( { destinationInbox } )}

            <div className="message padding-bottom-xs">
              {/* <sup><i className="fa fa-quote-left text-muted" aria-hidden="true"></i></sup>&ensp; */}
              {latestMessage.body ? nl2br( latestMessage.body ) : null}
            </div>
          </div>

          <Link to={`/conversation/${conversation.id}`}>
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
