When events are created, updated and removed on agendas where extended fields are defined, the legacy data structure must be updated:

Actions on an agenda with extended fields:

 * An event is created with some radios or checkboxes checked.
 * An event is updated with some radios or checkboxes checked.
 * An event is deleted: legacy custom values and tags refs are removed through db relations

The tag set is reduced to extract legacy tag ids associated with the checked option values using the key schemaOptionId. For that, both the schemaId and the checked optionId are needed.

For both create and update actions of an event, one call is made:

    legacy.updateTagAndCustomValues(
      agendaId,
      eventUid,
      [ schema, networkSchema ],
      [ schemaValues, networkSchemaValues ]
    );


# Tests

Basing tests on jep-2019-bretagne agenda
