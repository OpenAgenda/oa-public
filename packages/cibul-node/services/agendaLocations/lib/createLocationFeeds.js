'use strict';

const log = require('@openagenda/logs')('services/agendaLocations/lib/createLocationFeeds');

module.exports = async function createLocationFeeds(services, { agendaUid, locationUid, setUid }) {
  const { activities } = services;

  if (!activities) {
    log.warn('activities service is not enabled');
    return;
  }

  let locationFeed;
  let setFeed;

  // create location feed
  try {
    locationFeed = await activities.feed({
      entityType: 'location',
      entityUid: locationUid,
    }).create();
  } catch (err) {
    if (err.message !== 'Feed already exists') {
      throw err;
    }
  }

  // create locationSet feed
  if (setUid) {
    try {
      setFeed = await activities.feed({
        entityType: 'locationSet',
        entityUid: setUid,
      }).create();
    } catch (err) {
      if (err.message !== 'Feed already exists') {
        throw err;
      }
    }
  }

  // locationSet follows location
  if (setFeed) {
    try {
      await activities.feed(setFeed).follow(locationFeed);
    } catch (err) {
      if (err.message !== 'Feed already followed') {
        throw err;
      }
    }
  }

  // agenda follows location or locationSet
  try {
    const feedToFollow = setUid ? {
      entityType: 'locationSet',
      entityUid: setUid,
    } : {
      entityType: 'location',
      entityUid: locationUid,
    };

    await activities.feed({
      entityType: 'agenda',
      entityUid: agendaUid,
    }).follow(feedToFollow);
  } catch (err) {
    if (err.message !== 'Feed already followed') {
      throw err;
    }
  }
};
