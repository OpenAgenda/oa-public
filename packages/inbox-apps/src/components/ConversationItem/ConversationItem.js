import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { AuthorAvatar, Link, LinkContainer } from '../';

@connect(
  state => ({
    settings: state.settings
  })
)
export default class ConversationItem extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {
    const { conversation, settings: { maskEventTitle } } = this.props;
    const { getLabel } = this.context;

    if ( !conversation.latestMessage ) {
      return null;
    }

    const { latestMessage, resolvedAt, store, typeIdentifier } = conversation;
    const creationDate = moment( latestMessage.createdAt );

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={latestMessage}/>
        </div>

        <div className="media-body">
          <div className="media-heading">
            <b>{getMessageSenderName( latestMessage )}</b>
            {!maskEventTitle && store && store.params && store.params.eventTitle ? <Fragment>
              {' '}
              <span>
                <span className="text-muted">{getLabel( 'aboutEvent' )}</span>{' '}
                <Link to={`/agendas/${store.params.agendaUid}/events/${typeIdentifier}`} external>
                  {store.params.eventTitle}
                </Link>
              </span>
            </Fragment> : null}
            {resolvedAt ? <Fragment>
              {' '}
              <div className="tooltip-icon">
                <i className="fa fa-check" aria-hidden="true"></i>
                <div className="tooltip right" role="tooltip">
                  <div className="tooltip-arrow"></div>
                  <div className="tooltip-inner">{getLabel( 'resolvedConversation' )}</div>
                </div>
              </div>
            </Fragment> : null}
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
