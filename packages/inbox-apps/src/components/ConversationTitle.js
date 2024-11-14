import { Component } from 'react';
import { connect } from 'react-redux';
import I18nContext from '../contexts/I18nContext.js';
import getDestinationInbox from '../utils/getDestinationInbox.js';

function getInboxUserName(entity) {
  if (entity.inboxUser) {
    return entity.inboxUser.name;
  }

  return entity.inbox.name;
}

function isUser(entity, user) {
  if (entity.inboxUser && entity.inboxUser.userUid === user.uid) {
    return true;
  }

  if (entity.inbox.type === 'user' && entity.inbox.identifier === user.uid) {
    return true;
  }

  return false;
}

function isInInboxes(inboxes, user) {
  return inboxes.some((inbox) => isUser({ inbox }, user));
}

class ConversationTitle extends Component {
  static defaultProps = {
    EntityComponent: ({ children }) => (
      <span className="text-muted">{children}</span>
    ),
  };

  static contextType = I18nContext;

  render() {
    const {
      user,
      conversation,
      EntityComponent,
      settings: { context },
    } = this.props;
    const { getLabel } = this.context;

    const destinationInbox = getDestinationInbox({ user, conversation });

    const { store, type, typeIdentifier } = conversation;

    const creator = {
      inbox: conversation.creatorInbox,
      inboxUser: conversation.creatorInboxUser,
    };

    const userIsInConversation = isInInboxes(conversation.inboxes, user);

    switch (type) {
      case 'event':
        switch (context) {
          case 'event': {
            if (isUser(creator, user)) {
              if (destinationInbox.type === 'user') {
                return <>{getLabel('youContactedTheContributor')}</>;
              }
              return <>{getLabel('youContactedTheAgenda')}</>;
            }
            if (
              (destinationInbox.type === 'user'
                && destinationInbox.id !== creator.inbox.id)
              || (destinationInbox.type === 'agenda'
                && destinationInbox.id === creator.inbox.id)
            ) {
              return (
                <>
                  <EntityComponent type="user">
                    {getInboxUserName(creator)}
                  </EntityComponent>{' '}
                  {userIsInConversation
                    ? getLabel('contactedYou')
                    : getLabel('contactedTheContributor')}
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contactedTheAgenda')}
              </>
            );
          }
          case 'agenda': {
            if (isUser(creator, user)) {
              if (destinationInbox.type === 'user') {
                return (
                  <>
                    {getLabel('youContactedTheContributorOf')}{' '}
                    <EntityComponent
                      type="event"
                      eventUid={typeIdentifier}
                      agendaUid={store.params.agendaUid}
                    >
                      {store.params.eventTitle}
                    </EntityComponent>
                  </>
                );
              }
              return (
                <>
                  {getLabel('youContactedTheAgenda')} {getLabel('on')}{' '}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                </>
              );
            }
            if (
              (destinationInbox.type === 'user'
                && destinationInbox.id !== creator.inbox.id)
              || (destinationInbox.type === 'agenda'
                && destinationInbox.id === creator.inbox.id)
            ) {
              return (
                <>
                  <EntityComponent type="user">
                    {getInboxUserName(creator)}
                  </EntityComponent>{' '}
                  {userIsInConversation ? (
                    <>
                      {getLabel('contactedYou')} {getLabel('on')}{' '}
                    </>
                  ) : (
                    <>
                      {getLabel('contactedTheContributor')} {getLabel('of')}{' '}
                    </>
                  )}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contactedTheAgenda')} {getLabel('on')}{' '}
                <EntityComponent
                  type="event"
                  eventUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.eventTitle}
                </EntityComponent>
              </>
            );
          }
          case 'user': {
            if (isUser(creator, user)) {
              if (destinationInbox.type === 'user') {
                return (
                  <>
                    {getLabel('youContactedTheContributorOf')}{' '}
                    <EntityComponent
                      type="event"
                      eventUid={typeIdentifier}
                      agendaUid={store.params.agendaUid}
                    >
                      {store.params.eventTitle}
                    </EntityComponent>
                  </>
                );
              }
              return (
                <>
                  {getLabel('youContactedTheAgenda')}{' '}
                  <EntityComponent
                    type="agenda"
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.agendaTitle}
                  </EntityComponent>{' '}
                  {getLabel('on')}{' '}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                </>
              );
            }
            if (
              (destinationInbox.type === 'user'
                && destinationInbox.id !== creator.inbox.id)
              || (destinationInbox.type === 'agenda'
                && destinationInbox.id === creator.inbox.id)
            ) {
              return (
                <>
                  <EntityComponent type="user">
                    {getInboxUserName(creator)}
                  </EntityComponent>{' '}
                  {userIsInConversation ? (
                    <>
                      {getLabel('contactedYou')} {getLabel('on')}{' '}
                    </>
                  ) : (
                    <>
                      {getLabel('contactedTheContributor')} {getLabel('of')}{' '}
                    </>
                  )}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contactedTheAgenda')}{' '}
                <EntityComponent
                  type="agenda"
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.agendaTitle}
                </EntityComponent>{' '}
                {getLabel('on')}{' '}
                <EntityComponent
                  type="event"
                  eventUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.eventTitle}
                </EntityComponent>
              </>
            );
          }
          default:
            return null;
        }
      case 'contact_form':
        switch (context) {
          case 'agenda':
            if (isUser(creator, user)) {
              return <>{getLabel('youContactedTheAgenda')}</>;
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contactedTheAgenda')}
              </>
            );

          case 'user':
            if (isUser(creator, user)) {
              return (
                <>
                  {getLabel('youContactedTheAgenda')}{' '}
                  <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contactedTheAgenda')}{' '}
                <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                  {store.params.agendaTitle}
                </EntityComponent>
              </>
            );
          default:
            return null;
        }
      case 'request_contribute':
        switch (context) {
          case 'agenda':
            if (isUser(creator, user)) {
              return <>{getLabel('youWantToContributeToTheAgenda')}</>;
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('wantsToContributeToTheAgenda')}
              </>
            );

          case 'user':
            if (isUser(creator, user)) {
              return (
                <>
                  {getLabel('youWantToContributeToTheAgenda')}{' '}
                  <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                    {store.params.agendaTitle}
                  </EntityComponent>
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('wantsToContributeToTheAgenda')}{' '}
                <EntityComponent type="agenda" agendaUid={typeIdentifier}>
                  {store.params.agendaTitle}
                </EntityComponent>
              </>
            );
          default:
            return null;
        }
      case 'edition_request':
        switch (context) {
          case 'event':
            if (isUser(creator, user)) {
              return <>{getLabel('youRequestedEditingRights')}</>;
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('requestedEditingRights')}
              </>
            );

          case 'agenda':
            if (isUser(creator, user)) {
              return (
                <>
                  {getLabel('youRequestedEditingRights')} {getLabel('on')}{' '}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('requestedEditingRights')} {getLabel('on')}{' '}
                <EntityComponent
                  type="event"
                  eventUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.eventTitle}
                </EntityComponent>
              </>
            );

          case 'user':
            if (isUser(creator, user)) {
              return (
                <>
                  {getLabel('youRequestedEditingRights')} {getLabel('on')}{' '}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                  {creator.inboxUser ? (
                    <>
                      {' '}
                      {getLabel('ofTheAgenda')}{' '}
                      <EntityComponent
                        type="agenda"
                        agendaUid={store.params.agendaUid}
                      >
                        {store.params.agendaTitle}
                      </EntityComponent>
                    </>
                  ) : null}
                </>
              );
            }
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('requestedEditingRights')} {getLabel('on')}{' '}
                <EntityComponent
                  type="event"
                  eventUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.eventTitle}
                </EntityComponent>
                {creator.inboxUser ? (
                  <>
                    {' '}
                    {getLabel('ofTheAgenda')}{' '}
                    <EntityComponent
                      type="agenda"
                      agendaUid={store.params.agendaUid}
                    >
                      {store.params.agendaTitle}
                    </EntityComponent>
                  </>
                ) : null}
              </>
            );
          default:
            return null;
        }
      case 'suggest_event_change':
        switch (context) {
          case 'agenda':
            if (isUser(creator, user)) {
              // Vous avez suggeré une modification sur l'événement XXX
              return (
                <>
                  {getLabel('youSuggestedAEventChange')}{' '}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>
                </>
              );
            }
            // XXX a suggeré une modification sur l'évenment YYY
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('suggestedAEventChange')}{' '}
                <EntityComponent
                  type="event"
                  eventUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.eventTitle}
                </EntityComponent>
              </>
            );

          case 'user':
            if (isUser(creator, user)) {
              // Vous avez suggeré une modification sur le l'évenement XXX de l'agenda YYY
              return (
                <>
                  {getLabel('youSuggestedAEventChange')}{' '}
                  <EntityComponent
                    type="event"
                    eventUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.eventTitle}
                  </EntityComponent>{' '}
                  {getLabel('ofTheAgenda')}{' '}
                  <EntityComponent
                    type="agenda"
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.agendaTitle}
                  </EntityComponent>
                </>
              );
            }
            // XXX a suggeré une modification sur l'événement YYY de l'agenda ZZZ
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('suggestedAEventChange')}{' '}
                <EntityComponent
                  type="event"
                  eventUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.eventTitle}
                </EntityComponent>{' '}
                {getLabel('ofTheAgenda')}{' '}
                <EntityComponent
                  type="agenda"
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.agendaTitle}
                </EntityComponent>
              </>
            );
          default:
            return null;
        }
      case 'suggest_location_change':
        switch (context) {
          case 'agenda':
            if (isUser(creator, user)) {
              // Vous avez suggeré une modification sur le lieu XXX
              return (
                <>
                  {getLabel('youSuggestedALocationChange')}{' '}
                  <EntityComponent
                    type="location"
                    locationUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.locationName}
                  </EntityComponent>
                </>
              );
            }
            // XXX a suggeré une modification sur le lieu YYY
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('suggestedALocationChange')}{' '}
                <EntityComponent
                  type="location"
                  locationUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.locationName}
                </EntityComponent>
              </>
            );

          case 'user':
            if (isUser(creator, user)) {
              // Vous avez suggeré une modification sur le lieu XXX de l'agenda YYY
              return (
                <>
                  {getLabel('youSuggestedALocationChange')}{' '}
                  <EntityComponent
                    type="location"
                    locationUid={typeIdentifier}
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.locationName}
                  </EntityComponent>{' '}
                  {getLabel('ofTheAgenda')}{' '}
                  <EntityComponent
                    type="agenda"
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.agendaTitle}
                  </EntityComponent>
                </>
              );
            }
            // XXX a suggeré une modification sur le lieu YYY de l'agenda ZZZ
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('suggestedALocationChange')}{' '}
                <EntityComponent
                  type="location"
                  locationUid={typeIdentifier}
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.locationName}
                </EntityComponent>{' '}
                {getLabel('ofTheAgenda')}{' '}
                <EntityComponent
                  type="agenda"
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.agendaTitle}
                </EntityComponent>
              </>
            );
          default:
            return null;
        }
      case 'contact_member':
        switch (context) {
          case 'agenda':
            if (isUser(creator, user)) {
              // Vous avez contacté Jean-Phil
              return (
                <>
                  {getLabel('youContacted')}{' '}
                  <EntityComponent type="user">
                    {store.params.userName}
                  </EntityComponent>
                </>
              );
            }
            if (user.uid === store.params.userUid) {
              // Kévin vous a contacté
              return (
                <>
                  <EntityComponent type="user">
                    {getInboxUserName(creator)}
                  </EntityComponent>{' '}
                  {getLabel('contactedYou')}
                </>
              );
            }
            // Kévin a contacté Jean-Phil
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contacted')}{' '}
                <EntityComponent type="user">
                  {store.params.userName}
                </EntityComponent>
              </>
            );

          case 'user':
            if (isUser(creator, user)) {
              // Vous avez contacté Jean-Phil sur l'agenda XXX
              return (
                <>
                  {getLabel('youContacted')}{' '}
                  <EntityComponent type="user">
                    {store.params.userName}
                  </EntityComponent>{' '}
                  {getLabel('onTheAgenda')}{' '}
                  <EntityComponent
                    type="agenda"
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.agendaTitle}
                  </EntityComponent>
                </>
              );
            }
            if (user.uid === store.params.userUid) {
              // Kévin vous a contacté sur l'agenda XXX
              return (
                <>
                  <EntityComponent type="user">
                    {getInboxUserName(creator)}
                  </EntityComponent>{' '}
                  {getLabel('contactedYou')} {getLabel('onTheAgenda')}{' '}
                  <EntityComponent
                    type="agenda"
                    agendaUid={store.params.agendaUid}
                  >
                    {store.params.agendaTitle}
                  </EntityComponent>
                </>
              );
            }
            // Kévin a contacté Jean-Phil sur l'agenda XXX
            return (
              <>
                <EntityComponent type="user">
                  {getInboxUserName(creator)}
                </EntityComponent>{' '}
                {getLabel('contacted')}{' '}
                <EntityComponent type="user">
                  {store.params.userName}
                </EntityComponent>{' '}
                {getLabel('onTheAgenda')}{' '}
                <EntityComponent
                  type="agenda"
                  agendaUid={store.params.agendaUid}
                >
                  {store.params.agendaTitle}
                </EntityComponent>
              </>
            );
          default:
            return null;
        }
      case 'request_agenda_schema':
        return getLabel('agendaSchemaTitle');
      case 'request_private_agenda':
        return getLabel('privateAgendaTitle');
      case 'request_public_agenda':
        return getLabel('publicAgendaTitle');
      case 'request_official_agenda':
        return getLabel('officialAgendaTitle');
      case 'request_limit_dates':
        return getLabel('limitDatesTitle');
      case 'request_moderators':
        return getLabel('moderatorsTitle');
      case 'request_write_to_all':
        return getLabel('writeToAllTitle');
      case 'support':
        if (isUser(creator, user)) {
          // Vous avez contacté le support
          return <>{getLabel('youContactedSupport')}</>;
        }
        // XXX a contacté le support
        return (
          <>
            <EntityComponent type="user">
              {getInboxUserName(creator)}
            </EntityComponent>{' '}
            {getLabel('contactedSupport')}
          </>
        );

      default:
        return null;
    }
  }
}

export default connect((state) => ({
  settings: state.settings,
}))(ConversationTitle);
