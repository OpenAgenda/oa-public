# Overview

This service allows adding references within an event to other events in the same agenda.

The event form has a component to create new references. These are then exposed in the event page as well as in the event exports of the agenda.

Agendas having the setting "event-references"


# Components

Two redux-react apps:

 * **Show**: displays the event references
 * **Editor**: enables the user to edit event references

## Show

The props:
  * **events**: the list of referenced events to display. See structure below.
  * **lang**: the language in which the events and labels should be displayed

An event item should be like this:
```
{
  "uid": 222,
  "title": {
    "fr" : "Kay"
  },
  "link" : "#someotherlink",
  "location": {
    "name": "Chez Janine",
    "address": "Passage Ponceau"
  },
  "dateRange": {
    "fr" : "15 mars",
    "en" : "15 march"
  }
}
```
## Editor

The props:
 * **initUids**: The list of event uids already associated with the event at time of initialization
 * **onChange**: Callback called when the list of uids was updated
 * **info**: optional - A text info to display below the component label
 * **lang**: the language in which the events and labels should be displayed
 *  **sample**: optional - if event data is set here, will enable auto suggestion feature. The set data is sent to a specific suggestions endpoint at the server to fetch matching event suggestions.