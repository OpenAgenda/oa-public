#Overview

This logger lib adds some functionality to the base logentries library:

* log function generator with namespace initialization
* value loader to be reprinted at each subsequent log ( for example, if the log function is attached to the req object, it is useful to load user data once only and have it reprinted at each following log )