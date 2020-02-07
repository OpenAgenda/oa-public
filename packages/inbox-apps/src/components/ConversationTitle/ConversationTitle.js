import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import I18nContext from '../../contexts/I18nContext';
import getDestinationInbox from '../../utils/getDestinationInbox';

@connect( state => ({
  settings: state.settings
}) )
export default class ConversationTitle extends Component {
  static defaultProps = {
    EntityComponent: ( { children } ) => <span className="text-muted">{children}</span>
  };

  static contextType = I18nContext;

  render() {
    const {
      user, conversation, EntityComponent,
      settings: { context }
    } = this.props;
    const { getLabel } = this.context;

    const destinationInbox = getDestinationInbox( { user, conversation } );

    const { store, type, typeIdentifier } = conversation;

    const creator = {
      inbox: conversation.creatorInbox,
      inboxUser: conversation.creatorInboxUser
    };

    const userIsInConversation = isInInboxes( conversation.inboxes, user );

    switch ( type ) {
      case 'event':
        switch ( context ) {
          case 'event': {
            if ( isUser( creator, user ) ) {
              if ( destinationInbox.type === 'user' ) {
                return <Fragment>{getLabel( 'youContactedTheContributor' )}</Fragment>;
              } else {
                return <Fragment>{getLabel( 'youContactedTheAgenda' )}</Fragment>;
              }
            } else {
              if (
                (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id)
                || (destinationInbox.type === 'agenda' && destinationInbox.id === creator.inbox.id)
              ) {
                return (
                  <Fragment>
                    <EntityComponent type="user">
                      {getInboxUserName( creator )}
                    </EntityComponent>{' '}
                    {userIsInConversation ? getLabel( 'contactedYou' ) : getLabel( 'contactedTheContributor' )}
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
            if ( isUser( creator, user ) ) {
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
              if (
                (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id)
                || (destinationInbox.type === 'agenda' && destinationInbox.id === creator.inbox.id)
              ) {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {userIsInConversation ? (
                      <Fragment>
                        {getLabel( 'contactedYou' )} {getLabel( 'on' )}{' '}
                      </Fragment>
                    ) : (
                      <Fragment>
                        {getLabel( 'contactedTheContributor' )} {getLabel( 'of' )}{' '}
                      </Fragment>
                    )}
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
            if ( isUser( creator, user ) ) {
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
              if (
                (destinationInbox.type === 'user' && destinationInbox.id !== creator.inbox.id)
                || (destinationInbox.type === 'agenda' && destinationInbox.id === creator.inbox.id)
              ) {
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {userIsInConversation ? (
                      <Fragment>
                        {getLabel( 'contactedYou' )} {getLabel( 'on' )}{' '}
                      </Fragment>
                    ) : (
                      <Fragment>
                        {getLabel( 'contactedTheContributor' )} {getLabel( 'of' )}{' '}
                      </Fragment>
                    )}
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
            if ( isUser( creator, user ) ) {
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
            if ( isUser( creator, user ) ) {
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
            if ( isUser( creator, user ) ) {
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
            if ( isUser( creator, user ) ) {
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
      case 'edition_request':
        switch ( context ) {
          case 'event':
            if ( isUser( creator, user ) ) {
              return <Fragment>{getLabel( 'youRequestedEditingRights' )}</Fragment>;
            } else {
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'requestedEditingRights' )}
                </Fragment>
              );
            }
          case 'agenda':
            if ( isUser( creator, user ) ) {
              return (
                <Fragment>
                  {getLabel( 'youRequestedEditingRights' )}{' '}
                  {getLabel( 'on' )}{' '}
                  <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.eventTitle}
                  </EntityComponent>
                </Fragment>
              );
            } else {
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'requestedEditingRights' )}{' '}
                  {getLabel( 'on' )}{' '}
                  <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.eventTitle}
                  </EntityComponent>
                </Fragment>
              );
            }
          case 'user':
            if ( isUser( creator, user ) ) {
              return (
                <Fragment>
                  {getLabel( 'youRequestedEditingRights' )}{' '}
                  {getLabel( 'on' )}{' '}
                  <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.eventTitle}
                  </EntityComponent>
                  {creator.inboxUser ? (
                    <Fragment>
                      {' '}{getLabel( 'ofTheAgenda' )}{' '}
                      <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                        {store.params.agendaTitle}
                      </EntityComponent>
                    </Fragment>
                  ) : null}
                </Fragment>
              );
            } else {
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'requestedEditingRights' )}{' '}
                  {getLabel( 'on' )}{' '}
                  <EntityComponent type="event" eventUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.eventTitle}
                  </EntityComponent>
                  {creator.inboxUser ? (
                    <Fragment>
                      {' '}{getLabel( 'ofTheAgenda' )}{' '}
                      <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                        {store.params.agendaTitle}
                      </EntityComponent>
                    </Fragment>
                  ) : null}
                </Fragment>
              );
            }
        }
      case 'suggest_location_change':
        switch ( context ) {
          case 'agenda':
            if ( isUser( creator, user ) ) {
              // Vous avez suggeré une modification sur le lieu XXX
              return (
                <Fragment>
                  {getLabel( 'youSuggestedALocationChange' )}{' '}
                  <EntityComponent type="location" locationUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.locationName}
                  </EntityComponent>
                </Fragment>
              );
            } else {
              // XXX a suggeré une modification sur le lieu YYY
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'suggestedALocationChange' )}{' '}
                  <EntityComponent type="location" locationUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.locationName}
                  </EntityComponent>
                </Fragment>
              );
            }
          case 'user':
            if ( isUser( creator, user ) ) {
              // Vous avez suggeré une modification sur le lieu XXX de l'agenda YYY
              return (
                <Fragment>
                  {getLabel( 'youSuggestedALocationChange' )}{' '}
                  <EntityComponent type="location" locationUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.locationName}
                  </EntityComponent>
                  {' '}{getLabel( 'ofTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </Fragment>
              );
            } else {
              // XXX a suggeré une modification sur le lieu YYY de l'agenda ZZZ
              return (
                <Fragment>
                  <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                  {getLabel( 'suggestedALocationChange' )}{' '}
                  <EntityComponent type="location" locationUid={typeIdentifier} agendaUid={store.params.agendaUid}>
                    {store.params.locationName}
                  </EntityComponent>
                  {' '}{getLabel( 'ofTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </Fragment>
              );
            }
        }
      case 'contact_member':
        switch ( context ) {
          case 'agenda':
            if ( isUser( creator, user ) ) {
              // Vous avez contacté Jean-Phil
              return (
                <Fragment>
                  {getLabel( 'youContacted' )}{' '}
                  <EntityComponent type="user">{store.params.userName}</EntityComponent>
                </Fragment>
              );
            } else {
              if ( user.uid === store.params.userUid ) {
                // Kévin vous a contacté
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedYou' )}
                  </Fragment>
                );
              } else {
                // Kévin a contacté Jean-Phil
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contacted' )}{' '}
                    <EntityComponent type="user">{store.params.userName}</EntityComponent>
                  </Fragment>
                );
              }
            }
          case 'user':
            if ( isUser( creator, user ) ) {
              // Vous avez contacté Jean-Phil sur l'agenda XXX
              return (
                <Fragment>
                  {getLabel( 'youContacted' )}{' '}
                  <EntityComponent type="user">{store.params.userName}</EntityComponent>{' '}
                  {getLabel( 'onTheAgenda' )}{' '}
                  <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </Fragment>
              );
            } else {
              if ( user.uid === store.params.userUid ) {
                // Kévin vous a contacté sur l'agenda XXX
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contactedYou' )}{' '}
                    {getLabel( 'onTheAgenda' )}{' '}
                    <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                      {store.params.agendaTitle}
                    </EntityComponent>
                  </Fragment>
                );
              } else {
                // Kévin a contacté Jean-Phil sur l'agenda XXX
                return (
                  <Fragment>
                    <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
                    {getLabel( 'contacted' )}{' '}
                    <EntityComponent type="user">{store.params.userName}</EntityComponent>{' '}
                    {getLabel( 'onTheAgenda' )}{' '}
                    <EntityComponent type="agenda" agendaUid={store.params.agendaUid}>
                      {store.params.agendaTitle}
                    </EntityComponent>
                  </Fragment>
                );
              }
            }
        }
      case 'support':
        if ( isUser( creator, user ) ) {
          // Vous avez contacté le support
          return (
            <Fragment>
              {getLabel( 'youContactedSupport' )}
            </Fragment>
          );
        } else {
          // XXX a contacté le support
          return (
            <Fragment>
              <EntityComponent type="user">{getInboxUserName( creator )}</EntityComponent>{' '}
              {getLabel( 'contactedSupport' )}
            </Fragment>
          );
        }
    }

    return null;
  }
}

function getInboxUserName( entity ) {
  if ( entity.inboxUser ) {
    return entity.inboxUser.name;
  }

  return entity.inbox.name;
}

function isUser( entity, user ) {
  if ( entity.inboxUser && entity.inboxUser.userUid === user.uid ) {
    return true;
  }

  if ( entity.inbox.type === 'user' && entity.inbox.identifier === user.uid ) {
    return true;
  }

  return false;
}

function isInInboxes( inboxes, user ) {
  return inboxes.some( inbox => isUser( { inbox }, user ) );
}
