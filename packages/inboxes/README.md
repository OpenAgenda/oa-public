# Overview

Table of contents:
 * Overview
 * Inbox
 * Conversation
 * Integration of the Service

## Overview

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

## Listing conversations and display contexts

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



## Model proposition

Here are the tables could fill requirements

    inbox (id, type)
    inbox_user ( id, inbox_id, user_uid )
    conversation ( id )
    inbox_conversation ( inbox_id, conversation_id, created_at, updated_at )
    message ( id, conversation_id, inbox_user_id, created_at )

### Displaying conversations from one inbox

    select c.* from conversation as c
    left join inbox_conversation as ic on c.id=ic.conversation_id
    where ic.inbox_id={inboxId}

### Displaying conversations of a user

    select c.* from conversation as c
    left join inbox_conversation as ic on ic.conversation_id=c.id
    left join inbox_user as iu on ic.inbox_id=iu.inbox_id
    where iu.user_uid={userUid}




Features **include**:

 * Inboxes are fetched by their unique identifiers and host a list of conversations. Each conversation can be referenced by multiple inboxes.
 * A conversation hosts a list of messages sorted chronologically and a list of user references, identifying the users involved in the conversation
 * Conversations can be listed through inboxes. Each conversation can belong to multiple inboxes, these are set at the creation of the conversation.
 * Conversation users are added when new messages are appended to the conversation. If the author of the message is a newcomer, it is added to the list of user references of the conversation. 
 
 A view on a user home could just be an inbox view mashup. Conversations from several inboxes could just be listed by throwing in multiple inbox ids to a conversation list.

 Or a conversation could always be between two inboxes. You still would need an inbox for the user, and an inbox for the agenda. The conversation displayed inside the user inbox would show the agenda as the only other party whereas the conversation on the agenda part would have the detail ( onBehalf ) of the involved parties. So each message would only need a originInboxId and an optional author identifier info ( which would always be a user )

 So a conversation links two inboxes ( an agenda and a user most of the time )

 A message icon in an user tab should show messages from multiple inboxes: his and the ones matching the agendas where he is administrator or moderator


       [ Inbox ]              <- [ Conversation ] ->            [ Inbox ]
    ( of an OA user)                                          (of an Agenda)


But how are conversations retrieved in that last case?
The user needs to be registered in a bunch of inboxes as invitations arrive.

A user could just be added to an inbox when he starts to write a message from that inbox, so that it would be easier to list conversations from his home.

    select * from conversation as c
    left join conversation_inbox as ci on ci.conversation_id = c.id
    left join inbox_user as ibu on ibu.inbox_id=ci.inbox_id
    where ibu.id = {identifier}



Features **exclude**:

 * The notion of 'agenda'. An inbox does not know what an agenda is. It only knows about user references, inbox identifiers, conversations and messages.
 * Group actions on multiple inboxes, like for example a .list for inboxes.
 * Authentication/Authorization of conversation users

A conversation could be referenced in multiple inboxes. Meaning we'd need multiple conversation-inbox references, and everytime a conversation is created, it would be added to two inboxes.

## Inbox

 * An inbox contains a list of conversations

 * A conversation contains a list of messages

An inbox does not know what an agenda member is. The service does not handle access control. It just shows a list of conversations:

    // this
    inbox( idOfTheInbox )

    // is the shorthand of this
    inbox( idOfTheInbox ).conversations.list

An inbox conversation can be fetched by its type & identifier pair. This could be for example 'event' and {uidOfTheEvent}.

    inbox( idOfTheInbox ).conversations.get( 'event', uidOfTheEvent );

This can be used to display a conversation on an event page between event owners

To add a message, we do not care who can or cannot from the perspective of this service. All we need is a user identifier. A user uid will be fine:

    inbox( idOfTheInbox )

We can start with saying that the idOfTheInbox is the uid of the host agenda. This will make it easier to integrate

    inbox( uidOfHostAgenda )

Then if one day we need to create an inbox for something else than an agenda, we say that:

    inbox( { type: 'agenda', uid: 12930103 } )

Is the long version of

    inbox( uidOfAgenda )

And for a network inbox - which may never be required - we just write

    inbox( { type: 'network', uid: uidOfNetwork } );


## Conversation

A conversation needs to be identifiable by a unique identifier ( to stick it to a 'reply-to' in a mail: 'reply-to: 192014.user-12908331.conversations@openagenda.com' ). Messages appended sequentially to a conversation, using an .addMessage method.

    // fetch a conversation like this
    const conversation = await inbox( 12345678 ).get( 12908331 );

    // or like this
    const conversation = await inbox( 12345678 ).get( { uid: 12908331 } );

The integrating controller can figure out if the user is a involved in the conversation, the service only registers the identifier of the user of a message when it is added to a conversation.

### Types

Every conversation has a type. A type is defined at initialization, bundled with its set of actions, title formatting rules and whatnot.

For example:

 * an 'event' conversation needs a url and a title to generate a linked conversation. It has no action.
 * a 'contact' conversation needs the name of the user writing a message for the title label
 * a 'contributioninvitationrequest' needs 2 actions: 'accept' or 'reject'; it also needs the name of the requesting user for the title label


### Resolution

Conversations with actions are marked as 'resolved' when an action has been taken. Conversations without any action are marked as resolved when a user other than the conversation creator ( author of the first message ) submits a message ( or a default resolve action could be used for action-less conversations? )


### Messages

An anonymous message could be:

    await conversation.addMessage( 'J\'ai un colis pour le 21, je peux le laisser ici?' );

Specify an author will make it less anonymous ( allowing us to display more user info with the message )

    await conversation.addMessage( 'Oui, on a l\'habitude', { author: 12345678 } );

This is the same as:

    await conversation.addMessage( 'Uiiiii, vous êtes quiiii', { author: { uid: 12345678, type: 'user' } } );

Often, a message author will write on behalf of another entity, his organization ( or agenda ) in OA use cases:

    await conversation.addMessage( 'Le mec d\'UPS.', { author: 19209283, onBehalf: { type: 'transporter', uid: 921983 } } );

Types are relevent to identify what kind of identifier is being used. A default type can be specified at init of the service. The service does not care what all possible types are.

    await conversation.addMessage( 'Je signe où?', { 
      author: 19209283, 
      onBehalf: { 
        type: 'organization', 
        uid: 930390103 
      } 
    } );

A default type could also be defined at service initialization for the onBehalf option, to make it shorter to add messages:

service.init( {
  // ...
  defaultTypes: {
    inbox: 'agenda'
    author: 'user',
    onBehalf: 'agenda'
  }
  // ...
} );

Adding a message would be then easier:

    await conversation.addMessage( 'Ici.', { author: 19209283, onBehalf: 921983 } );

### Deletion

When a conversation is deleted from an inbox, it is deleted from all inboxes.

When an inbox is deleted, all conversations linked to that inbox and no other are deleted as well

### Actions

Actions are 


## Integration of the Service

In the OpenAgenda platform, the integrated service lifecycle will include the following events:

 * An inbox is created when an agenda is created. An inbox reference will be added to the agenda model
 * An inbox is deleted when an agenda is deleted.
 * An inbox is created when a user is created. An inbox reference will be added to the user model
 * An inbox is deleted when a user is deleted.
 * A conversation is created in an agenda's inbox when a contributor submits a message from his contributed event page
 * A conversation is created in an agenda's inbox when a moderator or administrator submits a message from an event page in the context of that agenda
 * When a user opens a contact form of an agenda and has not sent a message prior, a new conversation is created upon submission of a first message
 * When a user returns to a contact form on an agenda after having submitted a message through the contact form in the past, he returns to the previously created contact form conversation
 * An administrator or moderator cannot open a contact form conversation on the agenda front end.
 * 

Service interfaces for conversations ( onCreate, onUpdate ), are used to interface with the code that will ensure that relevent mails are sent