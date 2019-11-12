'use strict';

const _ = require('lodash');
const parseOAEvent = require('@openagenda/event-search').utils.parsers.OAEvent;

module.exports = (agenda, formSchema, event, member) => parseOAEvent(formSchema, {
  ...event,
  agenda: _.pick(agenda, [
    'slug', 'uid', 'official', 'title', 'description', 'url', 'image', 'updatedAt', 'createdAt', 'private', 'indexed'
  ]),
  member
});
