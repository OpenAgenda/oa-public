# Overview

An inbox contains a list of conversations

A conversation contains a list of messages

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

    inbox( 'agenda', uidOfAgenda )

Is the long version of

    inbox( uidOfAgenda )

And for a network inbox - which may never be required - we just write

    inbox( 'network', uidOfNetwork );


A conversation needs to be identifiable by a unique hash ( to stick it to a 'reply-to' in a mail: 'reply-to: 192014.user-abdc21fdqjhjglkqsfdq.conversations@openagenda.com' )

The integrating controller can figure out if the user is a involved in the conversation.