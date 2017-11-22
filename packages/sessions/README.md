# Overview

The sessions service. Handles and provides information on open sessions of the OpenAgenda platform. Sessions are either logged or not.

Includes: 

 * the core sessions service
 * middleware for interfacing with authentication web app
 * a schema that dictates what should be in a session on the client side and on the server side
 * a server for providing service read features through an interface

The reference for the state of the session is the cookie. Additional information is stored on a distributed store on the servers and is kept in sync with the cookie.

Cookie-stored info are:

 * flash: when set, displays a message on the browser with the given text
 * user.lang: reference for the language of the user
 * user.uid: identifier of the user
 * notifications: a count of new notifications to be set by third party service
 * messages: a flag indicating if there are any new messages ( set by third party service )

More about messages and notifications here below

Server-stored info are an extension of the cookie values when the user is logged

 * code
 * cookie values
 * id
 * email
 * latestActivity

Relies on cookie-parser for the cookie encryption part.


# Signed cookie invalidation

This was flagged as a security concern by the audit carried out by the city of Geneva. The cookie alone should not be used as a reference to define the state of a session.
 
 
# Core service features

 * **.open**: Opens a session when given a user uid
 * **.close**: Closes a session given its code
 * **.get**: Gets session data given a session code
 * **list**: Lists all current sessions ( usual list features without query bit: offset, limit, ( err, items, total ) => {}


# Client cookie methodds

## notifications

The client cookie exposes the following methods in a notifications namespace:

 * **client.notifications.setCount**: set the count of new notifications
 * **client.notifications.getCount**: get the count

## messages

The client cookie exposes the following methods in a messages namespace:

 * **client.messages.getNewFlag( [ unset = false ] )**: get flag value for new messages. Unset at the same time if the option is set to true.
 * **client.messages.setNewFlag: set the flag value ( boolean )