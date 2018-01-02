import React, { Component, Fragment } from 'react';
import _ from 'lodash';
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

    const { latestMessage, resolvedAt, store, typeIdentifier, inboxes, inboxContextId } = conversation;
    const creationDate = moment( latestMessage.createdAt );

    const creator = {
      inbox: conversation.creatorInbox,
      inboxUser: conversation.creatorInboxUser
    };

    const destinationInbox = inboxes
      .filter( v => v.id !== inboxContextId )
      .sort( o => Number( o.type === 'agenda' ) )
      .shift();

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={{ inbox: destinationInbox }}/>
        </div>

        <div className="media-body">
          <div className="media-heading margin-bottom-sm">
            {getLabel( 'createdBy' )}{' '}
            <AuthorAvatar author={creator} inline/>{' '}
            <b>{getInboxUserName( creator )}</b>
            {!maskEventTitle && store && store.params && store.params.eventTitle ? <Fragment>
              {' '}
              <span className="text-muted">{getLabel( 'aboutEvent' )}</span>{' '}
              <Link to={`/agendas/${store.params.agendaUid}/events/${typeIdentifier}`} external>
                {store.params.eventTitle}
              </Link>
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
            <sup><i className="fa fa-quote-left text-muted" aria-hidden="true"></i></sup>&ensp;
            {latestMessage.body || null}
          </div>
          <p title={creationDate.format( 'LLL' )}>
            <span className="text-muted">
            {getLabel( 'lastMessagePostedRelativeDate', { date: creationDate.fromNow( true ) } )}{' '}
              {getLabel( 'by' )}
            </span>{' '}
            <AuthorAvatar author={latestMessage} inline/>{' '}
            {getInboxUserName( latestMessage )}
            <br/>
            <Link to={`/conversation/${conversation.id}`}>
              {getLabel( 'viewConversation' )}
            </Link>
          </p>
        </div>
      </div>
    );
  }
}

function getInboxUserName( message ) {
  if ( message.inboxUser ) {
    return message.inboxUser.name;
  }

  return message.inbox.name;
}
