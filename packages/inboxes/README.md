# Overview


## Inbox

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

    inbox( { type: 'agenda', uid: 12930103 } )

Is the long version of

    inbox( uidOfAgenda )

And for a network inbox - which may never be required - we just write

    inbox( { type: 'network', uid: uidOfNetwork } );


## Conversation

A conversation needs to be identifiable by a unique identifier ( to stick it to a 'reply-to' in a mail: 'reply-to: 192014.user-12908331.conversations@openagenda.com' ). Messages appended sequentially to a conversation, using an .addMessage method.

    // fetch a conversation like this
    const conversation = await inbox( 12345678 ).get( 12908331 );

    // or like this
    const conversation = await inbox( 12345678 ).get( { uid: 12908331 } );

The integrating controller can figure out if the user is a involved in the conversation, the service only registers the identifier of the user of a message when it is added to a conversation.

### Types

Every conversation has a type. A type is defined at initialization, bundled with its set of actions, title formatting rules and whatnot.

For example:

 * an 'event' conversation needs a url and a title to generate a linked conversation. It has no action.
 * a 'contact' conversation needs the name of the user writing a message for the title label
 * a 'contributioninvitationrequest' needs 2 actions: 'accept' or 'reject'; it also needs the name of the requesting user for the title label


### Resolution

Conversations with actions are marked as 'resolved' when an action has been taken. Conversations without any action are marked as resolved when a user other than the conversation creator ( author of the first message ) submits a message ( or a default resolve action could be used for action-less conversations? )


### Messages

An anonymous message could be:

    await conversation.addMessage( 'J\'ai un colis pour le 21, je peux le laisser ici?' );

Specify an author will make it less anonymous ( allowing us to display more user info with the message )

    await conversation.addMessage( 'Oui, on a l\'habitude', { author: 12345678 } );

This is the same as:

    await conversation.addMessage( 'Uiiiii, vous êtes quiiii', { author: { uid: 12345678, type: 'user' } } );

Often, a message author will write on behalf of another entity, his organization ( or agenda ) in OA use cases:

    await conversation.addMessage( 'Le mec d\'UPS.', { author: 19209283, onBehalf: { type: 'transporter', uid: 921983 } } );

Types are relevent to identify what kind of identifier is being used. A default type can be specified at init of the service. The service does not care what all possible types are.

    await conversation.addMessage( 'Je signe où?', { author: 19209283, onBehalf: { type: 'organization', uid: 930390103 } } );

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

    await conversation.addMessage( 'Ici.', { author: 19209283, onBehalf: 921983 } );


### Actions

Actions are 