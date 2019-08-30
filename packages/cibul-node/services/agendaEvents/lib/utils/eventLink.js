'use strict';

module.exports = (root, agenda, event) => `${root}/${agenda.slug}/events/${event.slug}`;
