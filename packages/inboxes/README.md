
# Overview

The inbox service provides functionality enabling users to exchange messages stored in conversations. 

An inbox hosts a list of conversations.

    [Inbox]
      - [Conversation1]
      - [Conversation2]
      - [Conversation3]


Each conversation can be and most often is linked to two Inboxes 
( not more for now )

    [ Inbox 1]                    [Inbox 2]        [Inbox 3]        [Inbox 4]
      |  |  |-----[Conversation1]----|                    |             |
      |  |                                                |             |
      |  |----------------- [Conversation2] --------------|             |
      |                                                                 |
      |-------------------------------[Conversation3]-------------------|


A conversation is a flat list of messages

    [Conversation]
      - [Message1]
      - [Message2]
      - [Message3]


A conversation occurs between two inboxes


       [ Inbox ]              <- [ Conversation ] ->            [ Inbox ]
    ( of an OA user)                                          (of an Agenda)


Features **include**:

 * Inboxes are fetched by their unique identifiers and host a list of conversations. Each conversation can be referenced by multiple inboxes. Generally by two inboxes.
 * A conversation hosts a list of messages sorted chronologically and a list of user references, identifying the users involved in the conversation.
 * All conversations can be marked as 'resolved'. This will impact sorting in conversation list views
 * Conversations can be listed by a reference Inbox user or by an Inbox identifier.
 * An inbox can be identified using its id, or a type and external identifier. Recording an inbox type & external identifier ( say 'agenda' and an agendaUid in OA ) will simplify identifying inboxes in log streams.


Features **exclude**:

 * The notion of 'agenda'. An inbox does not know what an agenda is. It only knows about user references, inbox identifiers, conversations and messages.
 * Authentication/Authorization of inbox users
 * Any OpenAgenda business logic



# Listing conversations and display contexts

A conversation is always displayed in the context of an Inbox. This drives how message users are displayed: a message owner will be shown as:
 
 * a ConversationUser when the hosting inbox is the one of the ConversationUser
 * an Inbox owner reference when the hosting inbox is an external inbox

To illustrate this, say we have a [Conversation] going on between InboxConversationUser1 of Inbox1 and InboxConversationUser2 of Inbox2

     [Inbox1]                                    [Inbox2]
        |                                            |
        |----------------[Conversation]--------------|
        |                      |                     |
    [Inbox1User1]              |                [Inbox2User1]
        |                      |                     |
        |                  [Message1]----------------|
        |------------------[Message2]                |
                           [Message3]----------------|


## Conversation list display context

### In an inbox

Displaying a conversation list based on an Inbox reference means that the detail of all inbox users of that inbox should be given accross conversation and message displays. Inbox users from an external inbox should be displayed as the external inbox reference.


### From an InboxUser identifier

Any given user can participate to multiple inboxes. A view will be made available to list all conversations of a given user reference


### Examples

From Inbox1 perspective, the detail of which ConvUser from another Inbox is not visible. Message will look like this:

    Case 1: Loading a conversation in Inbox1 context

      Conversation: "A conversation about an event"

        Involving: [Inbox1User1], [Inbox2:ownerRef]

        Messages:

          [Inbox2:ownerRef]: "Hey, could you validate this?"


From Inbox2 perspective, the rule applies the other way around:

    Case 2:

      Conversation: "A conversation about an event"

        Involving: [Inbox1:ownerRef], [Inbox2User1]

        Messages:

          [InboxUser2]: "Hey, could you validate this?"



# Model

Here are the tables could fill requirements

    inbox (id, type)
    inbox_user ( id, inbox_id, user_uid )
    conversation ( id, type, store )
    inbox_conversation ( inbox_id, conversation_id, created_at, updated_at )
    message ( id, conversation_id, inbox_user_id, created_at )

### Displaying conversations from one inbox

    select c.* from conversation as c
    left join inbox_conversation as ic on c.id=ic.conversation_id
    where ic.inbox_id={inboxId}

### Displaying conversations of a user

    select c.* from conversation as c
    left join inbox_conversation as ic on ic.conversation_id=c.id
    left join inbox_user as iu on ic.inbox_id=iu.inbox_id
    where iu.user_uid={userUid}


# Inboxes

These are fetched either by their uid, or by a type and identifier. The type/identifier pairs are unique.

    const inboxes = require( 'inbox' );

    // get an inbox by id
    const inbox = inboxes( idOfTheInbox );

    // get an inbox by type & identifier
    const inbox = inboxes( { type: 'agenda', identifier: uidOfTheAgenda } )

# InboxUsers

Users can be added and removed through an inbox

    const inboxUsers = inboxes( idOfTheInbox ).users;

    await inboxUsers.add( { identifier } );

    // get using an inbox user auto-generated identifier
    const user = await inboxUsers.get( id );

    // get using the set identifier at creation
    const user = await inboxUsers.get( { identifier: uidOfTheUser } );


# Conversations

Conversations of an inbox can be listed through the inbox endpoint:

    const conversations = await inboxes( idOfTheInbox ).conversations( {filters}, offset, limit, {options} );

A user with one identifier can be linked to several inboxes. It is possible to list conversations based on an external user identifier

    const conversations = inboxes.users( { identifier } ).conversations( {filters}, offset, limit, {options} );

See Model section for details.

## Types and Actions

Conversations have typologies that define configuration that can format:

 * Actions: By default the action is the resolution of the conversation: 'Mark as resolved'. Custom actions can be specified for a type, which when triggered will call interfaces passing on data that was specified at the conversation creation to service interfaces.
 * Title: a conversation title can be specified for a given type, as a label with eventual variables specified at the creation of the conversation
 * Description: same as title

Types are defined at the initialization of the service. An example:

    const inbox = require( 'inbox' );

    inbox.init( {
      types: {
        contribution_request: {
          title: {
            from: { // optionally, title differs wether it is viewed by the conversation creator or the destinary
              fr: 'Demander à devenir contributeur',
              en: 'Request to become contributor'
            },
            to: {
              fr: '%user% veut devenir contributeur',
              en: '%user% wants to become contributor'
            }
          },
          description: {
            fr: 'La contribution sur cet agenda n\'est possible que sur invitation',
            en: 'Contribution on this agenda is possible only for invited users'
          },
          actions: {
            from: false, // the creator of the conversation in this case cannot resolve it. He can only delete it altogether.
            to: [ {
              code: 'accept',
              label: {
                fr: 'Accepter',
                en: 'Accept'
              }
            }, {
              code: 'refuse',
              label: {
                fr: 'Refuser',
                en: 'Refuse'
              }
            } ]
          }
        }
      },
      interfaces: {
        onResolve: async ( type, code = null, data = null ) => { // the type of the conversation, the code of the action, the data.

          // do business logic stuff

        }
      }
    } );


To build on the previous example, all data is set on the conversation at the time of its creation:

    // this conversation will link inbox of inboxUserId1 and inboxId2
    await conversations.create( inboxUserId1, inboxId2, 'contribution_request', {
      title: {
        user: Gaetan,
      },
      actions: {
        accept: {
          // whatever data is needed for the processing of the 'accept' action - it will be passed on to the onResolve interface
        }
      },
      message: 'Pourquoi personne m\'a invité? Rhôô.'
    }

## Messages

Adding a message to a conversation... the email will codify a inboxUserId, conversationId in the reply to address and that will be used by the integrating application to append a message to the conversation

# Integration in OpenAgenda

In the OpenAgenda platform, the integrated service lifecycle will include the following events:

## Inbox lifecycle

### creation

An inbox is created when

 * a new agenda is created
 * a new user is created

### deletion

An inbox is deleted when

 * an account is removed
 * an agenda is deleted

## Conversation Types

### Contact Form

A "contact_form" type conversation describes a conversation occurring between users having clicked on the contact form link of the agenda page and the agenda administrators. It links a user inbox with an agenda inbox.

When a user clicks on the contact form link:

1. The user cannot be an administrator or a moderator. If he is, he is redirected to a new conversation of 'agenda_internal' type.
2. If there is an unresolved contact_form conversation existing between that user and the agenda, that conversation is presented to him with all previous messages
3. If there is no previous unresolved contact_form conversation between him and the agenda, a new conversation form is presented, and a conversation is created on submission of that form

Actions of a contact_form conversation are the default 'Mark as resolved' ( or mark as unresolved ).


### Event

An "event" type conversation describes a conversation revolving around a specific event. It links a user inbox with an agenda inbox and can be viewed either on the event page or on the agenda inbox page.

A user that is neither a moderator nor an administrator of the context agenda will see:

 * if there are no unresolved conversations between him and the agenda on the topic of that event: a new conversation form
 * if there is an unresolved conversation between him and the agenda on the topic of that event: the detailed conversation

A user that is an administrator or a moderator of the context agenda will see:

 * if there is no conversation on the topic of that event: a new conversation form
 * if there are conversations on the topic of that event: a filtered list view of the agenda inbox, showing only conversations on the topic of that event, displaying unresolved conversations first.


### Agenda Internal

This type of conversation is linked to the agenda inbox only. It allows agenda adminmods to discuss different internal topics about that agenda. These conversations are created in the agenda inbox tab only


###  Contribution Request

A user that clicks on the 'Add an event' on an agenda with restricted contribution and that is not a member of that agenda will shown a form to allow him to request an access to contribution. That form will be:

 * a new conversation form of type 'contribution_request' if no conversation of the same type linking the user with the agenda already exists
 * a loaded conversation with a new message section if a contribution_request conversation already exists and is unresolved
 * a loaded conversation will be shown as 'closed' if the conversation is resolved; at that point and if the user reaches this page, it means that his request has been refused.