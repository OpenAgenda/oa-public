import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import cn from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import nl2br from '@openagenda/react-utils/dist/nl2br';
import { AuthorAvatar, Link } from '../';

@connect(
  state => ({
    settings: state.settings
  })
)
export default class ConversationItem extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderTitle( { destinationInbox } ) {
    const { user, conversation, settings: { context } } = this.props;
    const { getLabel } = this.context;

    const { store, type } = conversation;

    const creator = {
      inbox: conversation.creatorInbox,
      inboxUser: conversation.creatorInboxUser
    };

    switch ( type ) {
      case 'event':
        switch ( context ) {
          case 'event': {
            if ( isCreator( creator, user ) ) {
              if ( destinationInbox.type === 'user' ) {
                return <Fragment>{getLabel( 'youContactedTheContributor' )}</Fragment>;
              } else {
                return <Fragment>{getLabel( 'youContactedTheAgenda' )}</Fragment>;
              }
            } else {
              if ( destinationInbox.type === 'user' ) {
                return (
                  <Fragment>
                    <b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheContributor' )}
                  </Fragment>
                );
              } else {
                return <Fragment><b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheAgenda' )}</Fragment>;
              }
            }
          }
          case 'agenda': {
            if ( isCreator( creator, user ) ) {
              if ( destinationInbox.type === 'user' ) {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheContributor' )} {getLabel( 'of' )}{' '}
                    <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheAgenda' )} {getLabel( 'on' )}{' '}
                    <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              }
            } else {
              if ( destinationInbox.type === 'user' ) {
                return (
                  <Fragment>
                    <b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheContributor' )}{' '}
                    {getLabel( 'of' )} <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    <b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheAgenda' )}{' '}
                    {getLabel( 'on' )} <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              }
            }
          }
          case 'user': {
            if ( isCreator( creator, user ) ) {
              if ( destinationInbox.type === 'user' ) {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheContributor' )} {getLabel( 'of' )}{' '}
                    <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheAgenda' )} <b>{store.params.agendaTitle}</b>{' '}
                    {getLabel( 'on' )} <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              }
            } else {
              if ( destinationInbox.type === 'user' ) { // TODO
                return (
                  <Fragment>
                    <b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheContributor' )}{' '}
                    {getLabel( 'of' )} <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    <b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheAgenda' )}{' '}
                    <b>{store.params.agendaTitle}</b>{' '}
                    {getLabel( 'on' )} <b>{store.params.eventTitle}</b>
                  </Fragment>
                );
              }
            }
          }
        }
      case 'contact_form':
        switch ( context ) {
          case 'agenda':
            if ( isCreator( creator, user ) ) {
              return <Fragment>{getLabel( 'youContactedTheAgenda' )}</Fragment>;
            } else {
              return (
                <Fragment>
                  <b>{getInboxUserName( creator )}</b> {getLabel( 'contactedTheAgenda' )}
                </Fragment>
              );
            }
          case 'user':
            if ( isCreator( creator, user ) ) {
              return <Fragment>{getLabel( 'youContactedTheAgenda' )} <b>{store.params.agendaTitle}</b></Fragment>;
            } else {
              return (
                <Fragment>
                  <b>{getInboxUserName( creator )}</b>{' '}
                  {getLabel( 'contactedTheAgenda' )} <b>{store.params.agendaTitle}</b>
                </Fragment>
              );
            }
        }
      case 'request_contribute':
        switch ( context ) {
          case 'agenda':
            if ( isCreator( creator, user ) ) {
              return <Fragment>{getLabel( 'youWantToContributeToTheAgenda' )}</Fragment>;
            } else {
              return (
                <Fragment>
                  <b>{getInboxUserName( creator )}</b> {getLabel( 'wantsToContributeToTheAgenda' )}
                </Fragment>
              );
            }
          case 'user':
            if ( isCreator( creator, user ) ) {
              return (
                <Fragment>
                  {getLabel( 'youWantToContributeToTheAgenda' )}{' '}
                  <b>{store.params.agendaTitle}</b>
                </Fragment>
              );
            } else {
              return (
                <Fragment>
                  <b>{getInboxUserName( creator )}</b>{' '}
                  {getLabel( 'wantsToContributeToTheAgenda' )} <b>{store.params.agendaTitle}</b>
                </Fragment>
              );
            }
        }
    }

    return (
      <Fragment>
        {getLabel( 'createdBy' )}{' '}
        {/* <AuthorAvatar author={creator} inline/>{' '} */}
        <b>{getInboxUserName( creator )}</b>
      </Fragment>
    );
  }

  renderAuthorSentence( { destinationInbox } ) {
    const { getLabel } = this.context;
    const { user, conversation } = this.props;
    const { latestMessage } = conversation;

    const creationDate = moment( latestMessage.createdAt );
    const firstMessage = latestMessage.createdAt === conversation.createdAt;
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
              ? <AuthorAvatar author={latestMessage} inline/>
              : null}
            {getInboxUserName( latestMessage )}{' '}
            {getLabel( 'repliedAgo', { date: creationDate.fromNow( true ) } )}
          </div>
        );
      }
    }
  }

  render() {
    const { user, conversation } = this.props;
    const { getLabel } = this.context;

    if ( !conversation.latestMessage ) {
      return null;
    }

    const { latestMessage, inboxes, inboxContextId, resolvedAt } = conversation;

    const destinationInbox = getDestinationInbox( { user, inboxes, inboxContextId } );

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
            {this.renderTitle( { destinationInbox } )}{resolvedIcon}
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

function getCreatorName( conversation ) {
  if ( conversation.creatorInboxUser ) {
    return conversation.creatorInboxUser.name;
  }

  return conversation.creatorInbox.name;
}

function getContextInbox( conversation ) {
  return _.find( conversation.inboxes, [ 'id', conversation.inboxContextId ] )
}

function getDestinationInbox( { user, inboxes, inboxContextId } ) {
  let _inboxes = inboxes
    .sort( o => Number( o.type === 'agenda' ) )
    .filter( v => !(v.type === 'user' && v.identifier === user.uid) );

  return _inboxes.filter( v => v.id !== inboxContextId )[ 0 ] || _inboxes[ 0 ];
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
