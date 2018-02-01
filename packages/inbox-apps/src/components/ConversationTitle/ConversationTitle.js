import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { getContext } from 'recompose';
import { connect } from 'react-redux';
import getDestinationInbox from '../../utils/getDestinationInbox';

@connect( state => ({
  settings: state.settings
}) )
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationTitle extends Component {
  static defaultProps = {
    EntityComponent: ( { children } ) => <span className="text-muted">{children}</span>
  };

  render() {
    const {
      user, conversation, EntityComponent,
      settings: { context }, getLabel
    } = this.props;

    const destinationInbox = getDestinationInbox( { user, conversation } );

    const { store, type, typeIdentifier } = conversation;

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
              if ( destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id ) {
                return (
                  <Fragment>
                    <EntityComponent type="user">
                      {getInboxUserName( creator )}
                    </EntityComponent>{' '}
                    {getLabel( 'contactedTheContributor' )}
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedTheAgenda' )}
                  </Fragment>
                );
              }
            }
          }
          case 'agenda': {
            if ( isCreator( creator, user ) ) {
              if ( destinationInbox.type === 'user' ) {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheContributorOf' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheAgenda' )} {getLabel( 'on' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
                  </Fragment>
                );
              }
            } else {
              if ( destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id ) {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedTheContributor' )}{' '}
                    {getLabel( 'of' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedTheAgenda' )}{' '}
                    {getLabel( 'on' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
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
                    {getLabel( 'youContactedTheContributorOf' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    {getLabel( 'youContactedTheAgenda' )}{' '}
                    <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                      {store.params.agendaTitle}
                    </EntityComponent>{' '}
                    {getLabel( 'on' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
                  </Fragment>
                );
              }
            } else {
              if ( destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id ) {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedTheContributor' )}{' '}
                    {getLabel( 'of' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
                  </Fragment>
                );
              } else {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedTheAgenda' )}{' '}
                    <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                      {store.params.agendaTitle}
                    </EntityComponent>{' '}
                    {getLabel( 'on' )}{' '}
                    <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                      {store.params.eventTitle}
                    </EntityComponent>
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
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'contactedTheAgenda' )}
                </Fragment>
              );
            }
          case 'user':
            if ( isCreator( creator, user ) ) {
              return (
                <Fragment>
                  {getLabel( 'youContactedTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </Fragment>
              );
            } else {
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'contactedTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                    {store.params.agendaTitle}
                  </EntityComponent>
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
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'wantsToContributeToTheAgenda' )}
                </Fragment>
              );
            }
          case 'user':
            if ( isCreator( creator, user ) ) {
              return (
                <Fragment>
                  {getLabel( 'youWantToContributeToTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </Fragment>
              );
            } else {
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'wantsToContributeToTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </Fragment>
              );
            }
        }
    }
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