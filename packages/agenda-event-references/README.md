# Overview

This service allows adding references within an event to other events in the same agenda.

The event form has a component to create new references. These are then exposed in the event page as well as in the event exports of the agenda.

Agendas having the setting "event-references"


# Components

Two redux-react apps:

 * Show: displays the event references
 * Editor: enables the user to edit event references


# Implementation: a bare-bone version of the feature will be set up for early integration.

  * setup static version of components and test app.

  * event form component display on setting configuration ( agenda store ). bare-bone component statically refers two event uids for setting up legacy data bridge

  * service is initialized with app and interface starts with taking the agendaId as well as the referring event id.

  * legacy node bridge is used by php event save / update after event creation for hitting the service with the list of event id referrences to add with the
  source to add them;.. a 'setReferences' is needed here, update or create is not explicit from the outside.

  * on an event indexation, the references of the event are fetched and added to the event being indexed.

  * the event display gets the referrences via a ( agendaId, eventId ).getReferences(), then by getting the title/desc/image infos of these events.

  * the agenda exports extract the event data from the search index.

  * When a referred event is updated, service must dispatch the update to refferring events.

  * can the service give out rendered content to be displayed on the event page?
    it will need to hit the search interface when sollicited... Yes might as well.