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

Server-stored info are an extension of the cookie values when the user is logged

 * code
 * cookie values
 * id
 * email
 * latestActivity

Relies on cookie-parser for the cookie encryption part.
 
 
# Core service features

 * **.open**: Opens a session when given a user uid
 * **.close**: Closes a session given its code
 * **.get**: Gets session data given a session code
 * **list**: Lists all current sessions ( usual list features without query bit: offset, limit, ( err, items, total ) => {}