# Overview

## Table of content

 * Overview
 * Listing conversations and display contexts
 * Service things
 * Model
 * Conversation lists
 * Conversation gets
 * Conversation types and actions
 * Integration in OpenAgenda

## Pour toi, Kevin

Quelques petites notes pèle-mèle:

 * Cette doc ce concentre sur la partie interne au service d'abord, puis en dessous t'as une partie 'intégration dans OA' qui montre les types de conversations propres à OA.
 * On avait parlé de contexte de vue: quand un bonhomme débarque pour regarder ses conversation sur OA, il va le faire soit sur sa home, soit sur un admin agenda. Dans chaque cas, il va voir une liste de conversations avec juste un message d'affiché. L'auteur du message va être affiché aussi, mais le détail de cet auteur dépendra de son rapport au lecteur: si l'auteur du message fait partie des inbox_users de l'inbox du lecteur, le détail est donné sur son nom, image et tout. Si l'auteur est un inbox_user de l'inbox en face, alors le détail donné est celui de l'inbox en face.... qui est soit une inbox de type 'agenda', soit une inbox de type 'user'. Si c'est une inbox de type 'agenda', le lecteur va voir que c'est un agenda qui parle. Sinon, il va voir que c'est un user. Au final, ça se gère assez simplement au niveau des .list et .get des conversations. Je détaille ça en dessous.
 * Pour éviter de devoir lancer des scripts de build à chaque maj, tu peux faire des creates d'inbox à la volée lors d'un get et que tu ne trouves pas d'inbox. Comme ça les inbox se créeront au fil des tests d'intégration & au fil des tests post-mise en ligne. Une petite option { createOnNull: true } peut expliciter ce comportement dans les middlewares.

 Fais une première passe sur cette doc, puis une deuxième, puis on trouve un créneau pour revoir les points flous ou tes remarques


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
 
 * an InboxUser when the hosting inbox is the one of the ConversationUser
 * an Inbox owner reference when the hosting inbox is an external inbox

To illustrate this, say we have a [Conversation] going on between Inbox1User1 of Inbox1 and Inbox2User2 of Inbox2

    [Inbox1]-------------[Conversation]-------------[Inbox2]
      |                        |                       |
      |                        |                       |
      |                        |                       |
    [Inbox1User1]              |                  [Inbox2User1]
       |                       |                       |
       |                   [Message1]------------------|
       |-------------------[Message2]                  |
                           [Message3]------------------|


# Model

Here are the tables that fit the service storage requirements

    inbox

    The inbox is the top-most container of the service

     * id: unique id for the inbox. Used to get inbox
     * type: inbox typology ( in OA context, this would be 'agenda' or 'user' )
     * identifier: inbox identifier ( in oa context, this would be either the user uid or agenda uid ). type/identifier pair is unique identifier alone is not.

    inbox_user

    An inbox user is the link between an external user of the service and an inbox

     * id: unique id for an inbox user
     * inbox_id: reference to the parent inbox. An inbox user belongs to an inbox
     * identifier: external identifier for the inbox user ( in OA context, this would be a user uid )

    conversation

    A conversation is a container of messages. It is linked to at least one inbox, usually two.

     * id: unique id for a conversation
     * type: conversation type ( string ). Possible types are defined at service initialization. See section on types for details.
     * store: optional JSON-encoded store. Content depends on conversation type
     * featured_message_id: the message to be featured with conversation. Displayed on a conversation list view.
     * created_at
     * updated_at

    inbox_conversation

    This is the link between an inbox and a conversation

     * inbox_id
     * conversation_id

    conversation_message

     * id
     * conversation_id
     * content: body of the message
     * inbox_user_id: author of the message
     * created_at: for sorting and displaying

Notes:

 * conversation.featured_message_id: simplifies list fetches ( no need for sub-queries ) and gives the freedom to choose which message to display for a conversation at application logic level. Usually it'll be the latest message added to a conversation.


# Service things

## Inboxes

These are fetched either by their uid, or by a type and identifier. The type/identifier pairs are unique.

    const inboxes = require( 'inboxes' );

    // get an inbox by id
    const inbox = inboxes( idOfTheInbox );

    // get an inbox by type & identifier
    const inbox = inboxes( { type: 'agenda', identifier: uidOfTheAgenda } )

## InboxUsers

Users can be added and removed through an inbox

    const inboxUsers = inboxes( idOfTheInbox ).users;

    await inboxUsers.add( { identifier } );

    // get using an inbox user auto-generated identifier
    const user = await inboxUsers.get( id );

    // get using the set identifier at creation
    const user = await inboxUsers.get( { identifier: uidOfTheUser } );


## Conversations

Conversations of an inbox can be listed through the inbox endpoint:

    const conversations = await new Inbox( idOfTheInbox ).conversations( {filters}, offset, limit, {options} );

A user with one identifier can be linked to several inboxes. It is possible to list conversations based on an external user identifier

    const conversations = new Inbox.user( { identifier } ).conversations( {filters}, offset, limit, {options} );

See Model section for details on listing conversations

## Messages

The next examples show a conversation happening between two inboxes. A first one 'Boutique OpenAgenda' and the second one 'Passage Ponceau'. One InboxUser of the first is named 'Kevin' - another could be 'Guilhem' -, the second inbox has an InboxUser named 'Janine' ( the names of the second inbox and inboxuser are the same. ).

    const idOfTheInbox = 1;

    const conversation = await inboxes( idOfTheInbox ).conversations.get( conversationId );

    // we don't bother with pagination here. Conversations will not span years.
    const messages = await conversation.messages();

Fetched messages should contain inbox service information decorated with whatever info was required for display and fetched through interfaces. 

Without decoration, a message looks like this:

    [ {
      inbox: {
        id: 14, 
        type: 'agenda', 
        identifier: 281894 
      },
      inboxUser: {
        id: 1238 // the message was written from the same inbox from the user standpoint, so the user detail is given for the message
        identifier: 29109201 // in OA, this is the user uid. It is given at the creation of the inbox user.
      },
      content: 'Bla bla'
    } ]

After decoration through interfaces:

    [ {
      inbox: {
        id: 14, 
        type: 'agenda', 
        identifier: 281894 ,
        name: 'JEP 2017 : Occitanie',
        avatar: 'https://fdsfsq/fdsq.jpg'
      },
      inboxUser: {
        id: 1238,
        identifier: 29109201,
        name: 'Jutta Nachbauer',
        avatar: 'https://reuzruezoi/fdskj.jpg'
      },
      content: 'Bla bla'
    } ]

When the fetch message gives the detail of the inboxUser, it means it is to be displayed on the UI showing the conversation. The UI mirrors the level of detail given in the fetched data.


# Conversation lists

The service provides two possible ways to view conversation list.

One easy way: through one given inbox

    await inboxes( idOfTheInbox ).conversations( filters, offset, limit, options );

A second a bit more complex way: through a user reference

    await inboxes.user( { identifier } ).conversations( {filters}, offset, limit, {options} );

This second way is shown with more detailed as handling context is less straightforward here:

## List from a user external identifier

First, the query required to fetch the conversations linked to a user:

    select 
      c.id,                    # the conversation id
      ic.inbox_id,             # the inbox linking the conversation with the user's inbox
      i.type, i.identifier,    # the inbox external identifiers ( for interfaces )
      c.type,                  # the type of the conversation
      c.store,                 # any type-specific info for the conversation
      cm.content,              # the content of the featured message of the conversation. Plain text.
      cm.inbox_user_id,        # the user having authored the message
      cm_iu.inbox_id           # the inbox of the user having authored the message
      cm_iu.identifier           # the external identifier of the author of the message
    from conversation as c
    left join inbox_conversation as ic on ic.conversation_id=c.id
    left join inbox_user as iu on ic.inbox_id=iu.inbox_id
    left join inbox as i on ic.inbox_id=i.id
    left join conversation_message as cm on c.displayed_message_id=cm.id
    left join inbox_user as cm_iu on cm.inbox_user_id=cm_id.id
    where iu.identifier={userUid}


Then, when with that information in hand, the raw conversation list ( undecorated ) can be constructed. A simple rule of thumb to determine the level of detail to display for featured messages:

If the origin inbox of the featured message is the same as the conversation inbox, then the inboxUser author of the feature message can be set. As illustrated in the example:


    [ {
      id: 1,
      inbox: { // the inbox the calling user is linked to ( 'ic.inbox_id' in the query )
        id: 14, 
        type: 'agenda', 
        identifier: 281894 
      },
      type: 'contactForm',
      featuredMessage: {
        inbox: { // the inbox of the author of the message ( 'cm_iu.inbox_id' in the query )
          id: 12, // the inbox id is different, therefore the inbux_user author of the message is not set.
          type: 'user',
          identifier: 290192
        },
        content: 'Comment je fais pour aller à l\'événement?'
      }
    }, {
      id: 2,
      inbox: {
        id: 14, 
        type: 'agenda', 
        identifier: 281894 
      }
      type: 'event',
      store: {
        event: { title, uid }
      },
      featuredMessage: {
        inbox: {
          id: 14, // here the inbox id is the same, so the inboxUser is set, to allow its subsequent decoration and UI display.
          type: 'agenda', 
          identifier: 281894 
        },
        inboxUser: { // as per previous comment
          id: 1238,
          identifier: 29109201
        },
        content: 'Bla bla'
      }
    }, {
      id: 3,
      type: 'invitationRequest'
      inbox: {
        id: 13,
        type: 'user',
        identifier: 29192
      },
      featuredMessage: {
        inbox: {
          id: 13,
          type: 'user',
          identifier: 29192
        },
        inboxUser: {
          id: 29012,
          identifier: 29192
        },
        content: 'Je m\'appelle Bloutok Mac Space et je veux ajouter un événement.'
      }
    } ]


Once the raw list is in hand, interface methods can be solicited to decorate the data and make it ready for UI display. Interface methods essentially allow to fetch details on external resources based on external identifiers

    await interfaces.getInboxesDetails( [ { type, identifier } ] )

    await interfaces.getUsersDetails( [ { identifier } ] );

External services are responsible of finding the optimized way of retrieving that info. The inboxes service only asks.

Interfaces return lists of names and avatars matching the given types and/or identifiers

    [ {
      type: 'agenda',
      identifier: 20189321,
      name: 'JEP 2017 - Grand Est',
      avatar: 'https://fsdqfdsqdf.jpg'
    }, {
      type: 'user',
      identifer: 20192,
      name: 'Janine',
      avatar: 'https://fdqfd/caddydejanine.jpg'
    } ... ]

Conversation list result can then be decorated with fetched data. Taking from the previous example, this becomes:

    [ {
      id: 1,
      inbox: { // the inbox the calling user is linked to
        id: 14, 
        type: 'agenda', 
        identifier: 281894 
      },
      type: 'contactForm',
      featuredMessage: { // this message was written from another inbox from the one of the user. the user detail is not retrieved
        inbox: { 
          id: 12,
          type: 'user',
          identifier: 290192,
          name: 'Gaetan Pabrillant',
          avatar: 'https://awsbucket.com/avatardegaetanouunavatarpardefautdonneparlinterface.jpg'
        },
        content: 'Comment je fais pour aller à l\'événement?'
      }
    }, {
      id: 2,
      inbox: {
        id: 14, 
        type: 'agenda', 
        identifier: 281894 
      }
      type: 'event',
      store: {
        event: { title, uid }
      },
      featuredMessage: {
        inbox: {
          id: 14, 
          type: 'agenda', 
          identifier: 281894,
          name: 'JEP 2017 : Grand Est',
          avatar: 'https://bucket.com/lavatardelagenda.jpg',
        },
        inboxUser: { // the message was written from the same inbox from the user standpoint, so the user detail is given for the message
          id: 1238,
          identifier: 29109201 // in OA, this is the user uid. It is given at the creation of the inbox user.
          name: 'Elise Dumonteil',
          avatar: 'https://avatarpardéfaut.jpg'
        },
        content: 'Bonjour, pouvez-vous fournir plus de détails dans la description de votre événement?'
      }
    }, {
      id: 3,
      type: 'invitationRequest'
      inbox: {
        id: 13,
        type: 'user',
        identifier: 29192
      },
      featuredMessage: {
        inbox: {
          id: 13,
          type: 'user',
          identifier: 29192,
          name: 'JEP 2017 : Normandie',
          avatar: 'https://buket.com/fsqfdsqfs.jpgs'
        },
        inboxUser: {
          id: 29012,
          identifier: 29192 // here, the inbox_user points to the same external identifier as the inbox. Not a coincidence, this user is viewing a message he wrote from his own inbox context
          name: '...',
          avatar: '...'
        },
        content: 'Je m\'appelle Bloutok Mc Space et je veux ajouter un événement.'
      }
    } ]
    

Conversation list can be displayed according to what is available after decoration. If userInbox details are available, they are displayed. Otherwise, it means that they are out of reach of the view point.


## Listing conversations from an inbox

The previous list example was applicable to a conversation list fetched from a user external reference.

Or fetch the conversations of an inbox. Here, the first inbox join can be omitted in favor of a prior query fetching the parent inbox details, as it will always be the same.

    select
      c.id,                    # the conversation id
      c.type,                  # the type of the conversation
      c.store,                 # any type-specific info for the conversation
      cm.content,              # the content of the featured message of the conversation. Plain text.
      cm.inbox_user_id,        # the user having authored the message
      cm_iu.inbox_id           # the inbox of the user having authored the message
      cm_iu.identifier         # the external identifier of the author of the message
    from conversation as c
    left join inbox_conversation as ic on ic.conversation_id=c.id
    left join conversation_message as cm on c.displayed_message_id=cm.id
    left join inbox_user as cm_iu on cm.inbox_user_id=cm_id.id
    where ic.inbox_id = {inboxId} # or ic.type = 'agenda' and ic.identifier = 21898399
    
The construction of the listed conversation works the same way as in the previous case. On first undecorated list is built based on the query results, then interfaces are called for data decoration.



# Conversation types and actions

Conversations have typologies that define configuration that can format:

 * Actions: By default the action is the resolution of the conversation: 'Mark as resolved'. Custom actions can be specified for a type, which when triggered will call interfaces passing on data that was specified at the conversation creation to service interfaces.
 * Title: a conversation title can be specified for a given type, as a label with eventual variables specified at the creation of the conversation
 * Description: same as title

Types are defined at the initialization of the service. An example:

    const inboxes = require( 'inboxes' );

    inboxes.init( {
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

    // this conversation would link inbox of inboxUserId1 and destinationInboxId
    inboxes.users( inboxUserId1 ).conversations.create( destinationInboxId, 'contribution_request', {
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

    // a conversation can be created like this
    inboxes( originInboxId1 ).conversations.create( destinationInboxId, inboxUserId1, 'contribution_request', { ...


# Conversation gets

Two gets enpoints are possible ( a bit like lists ):

    await inboxes( idOfTheInbox ).conversations.get( id )

    await inboxes.user( { identifier } ).conversations.get( id )

The endpoint defines the context. An inbox get result will contain a complete list of its messages. These are written by users existing outside of the service, linked to the message through an inbox_user reference. This reference also indicates the inbox to which the message author is linked. The context of a displayed message depends on the message author's inbox.

 * The message's inbox_user.inbox_id points to the same inbox as the one of the context of the conversation: the inbox_user_id must be kept in the message item to allow decoration to fetch all details on the author for display
 * The message's inbox_user.inbox_id points to another inbox than the one of the context of the conversation: only the inbox_id of the message author must be kept in the message data so that only details on the inbox will be diplayed.

The context inbox is defined by the endpoint from which the get originates:

 * if the user views the conversations of one specific inbox, that inbox will be the the context inbox of all listed conversations
 * if the user views the conversations through his unique external reference, the inbox context of each displayed conversation varies. It corresponds to the 'ic.inbox_id' reference of the query given in section **List from a user external identifier**

To illustrate this, here is an extract of a conversation get where the inbox context is inbox id 456:

    {
      ...
      messages: [ {
        body: 'Alors il est où mon ptit clodo ce matin !?!',
        createdAt: Date,
        inboxId: 123
      }, {
        body: 'A gauche',
        createdAt: Bitlaterdate,
        inboxId: 456,
        inboxUserId: 21
      }, {
        body: 'Non je l\'ai vu se faire embarquer par les flics',
        createAt: Bitlaterdatestill,
        inboxId: 456,
        inboxUserId: 22
      } ]
      ...
    }

When this result will be decorated through interfaces, only the inbox users of inbox 456 will be used. The first message will be decorated with the result of an interface get on inboxId 123 only.


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


### Edition Request

Events that have been shared on an agenda cannot be edited by agenda administrators and moderators. Any agenda is free to add any published events available on the platform. In these cases, administrators can still request the event creator for edition rights for the agenda. In the administration menu, a link is placed at each event item where edition rights is not available to the agenda.
