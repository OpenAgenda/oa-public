'use strict';

const _ = require('lodash');
const parseOAEvent = require('@openagenda/event-search').utils.parsers.OAEvent;

const eventFormSchema = require('@openagenda/event-form/src/schema');

const defaultFormSchema = eventFormSchema({
  languages: true,
  excludeNonDataFields: false,
  access: null
});

module.exports = ({ agenda, formSchema, event, member }) => {
  const eventForSearch = parseOAEvent(formSchema || defaultFormSchema, {
    ...event,
    timezone: event.timezone || 'Europe/Paris',
    state: event.state === undefined ? 2 : event.state,
    agenda: _.pick(agenda || event.agenda, [
      'slug',
      'uid',
      'official',
      'title',
      'description',
      'url',
      'image',
      'updatedAt',
      'createdAt',
      'private',
      'indexed',
      'timezone'
    ])
  }, member);

  return eventForSearch;
};
