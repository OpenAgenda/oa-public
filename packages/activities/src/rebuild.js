const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('activities/rebuild');

function getUsersStream(config, options = {}) {
  const { knex, schemas } = config;

  const q = knex(schemas.user);

  if (options.since) {
    q.where('updated_at', '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

function getLocationSetsStream(config, options = {}) {
  const { knex, schemas } = config;

  const q = knex(schemas.locationSet);

  if (options.since) {
    q.where('updated_at', '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

function getEventsStream(config, options) {
  const { knex, schemas } = config;

  const q = knex(schemas.eventService)
    .select([
      `${schemas.eventService}.*`,
      `${schemas.user}.is_removed as userRemoved`,
    ])
    .join(schemas.user, `${schemas.eventService}.owner_uid`, `${schemas.user}.uid`);

  if (options.agendaUid) {
    q.where(`${schemas.eventService}.agenda_uid`, options.agendaUid);
  }

  if (options.since) {
    q.where(`${schemas.eventService}.updated_at`, '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

function getAgendasStream(config, options) {
  const { knex, schemas } = config;

  const q = knex(schemas.agenda)
    .select([
      `${schemas.agenda}.*`,
      `${schemas.aggregator}.id as aggId`,
    ])
    .leftJoin(schemas.aggregator, `${schemas.agenda}.id`, `${schemas.aggregator}.review_id`);

  if (options.agendaUid) {
    q.where(`${schemas.agenda}.uid`, options.agendaUid);
  }

  if (options.setUid) {
    q.where(`${schemas.agenda}.location_set_uid`, options.setUid);
  }

  if (options.since) {
    q.where(`${schemas.agenda}.updated_at`, '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

function getLocationsStream(config, options, agenda) {
  const { knex, schemas } = config;

  const q = knex(schemas.location)
    .where('agenda_id', agenda.id);

  if (agenda.location_set_uid) {
    q.where('set_uid', agenda.location_set_uid);
  }

  if (options.since) {
    q.where('updated_at', '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

function getAgendaEventsStream(config, options, agenda) {
  const { knex, schemas } = config;

  const q = knex(schemas.agendaEventService)
    .select([
      `${schemas.agendaEventService}.*`,
      `${schemas.location}.uid as locationUid`,
    ])
    .leftJoin(schemas.eventService, `${schemas.agendaEventService}.event_uid`, `${schemas.eventService}.uid`)
    .leftJoin(schemas.location, `${schemas.eventService}.location_uid`, `${schemas.location}.uid`)
    .where(`${schemas.agendaEventService}.agenda_uid`, agenda.uid);

  if (options.since) {
    q.where('updated_at', '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

function getMembersStream(config, options, agenda) {
  const { knex, schemas } = config;

  const q = knex(schemas.stakeholder)
    .select([
      `${schemas.stakeholder}.*`,
      `${schemas.user}.is_removed as userRemoved`,
    ])
    .join(schemas.user, `${schemas.stakeholder}.user_uid`, `${schemas.user}.uid`)
    .join(schemas.agenda, `${schemas.stakeholder}.agenda_uid`, `${schemas.agenda}.uid`)
    .where('agenda_uid', agenda.uid);

  if (options.since) {
    q.where(`${schemas.agenda}.updated_at`, '>=', new Date(options.since * 1000));
  }

  return q.stream();
}

async function removeFeed(service, feed) {
  log.debug(`remove feed ${feed.entity_type} ${feed.entity_uid}`);

  try {
    await service.feed({ id: feed.id }).remove();
    return true;
  } catch (e) {
    log.error(new VError({
      cause: e,
      info: {
        entityType: feed.entity_type,
        entityUid: feed.entity_uid,
      },
    }, 'Cannot remove feed'));
    return false;
  }
}

async function checkUserFollow(config, report, originFeed, targetFeed, feedFollow) {
  const { service, knex, schemas } = config;

  switch (originFeed.entityType) {
    case 'agenda': {
      // user (contributors) follow agenda
      const userUid = targetFeed.entityUid;
      const agendaUid = originFeed.entityUid;

      try {
        const store = JSON.parse(feedFollow.store);
        const member = await knex(schemas.stakeholder).first().where({
          agenda_uid: agendaUid,
          user_uid: userUid,
        });

        if (!member) {
          log.debug(`Feed user ${userUid} unfollow feed agenda ${agendaUid}`);
          await service.feed(targetFeed).unfollow(originFeed);
          report.userUnfollowAgenda += 1;
        } else if (member.credential !== store.credential) {
          log.debug(`Feed user ${userUid} refollow feed agenda ${agendaUid} with role ${member.credential} (before: ${store.credential})`);
          await service.feed(targetFeed).unfollow(originFeed);
          await service.feed(targetFeed).follow({
            entityType: originFeed.entityType,
            entityUid: originFeed.entityUid,
          }, { credential: member.credential });
          report.userRefollowAgenda += 1;
        }
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            agendaUid,
            userUid,
          },
        }, 'Feed user cannot unfollow feed agenda'));
      }
      break;
    }
    case 'event': {
      // user follow event when owner
      const userUid = targetFeed.entityUid;
      const eventUid = originFeed.entityUid;

      try {
        const event = await knex(schemas.eventService).first().where({
          uid: eventUid,
          owner_uid: userUid,
        });

        if (!event) {
          log.debug(`Feed user ${userUid} unfollow feed event ${eventUid}`);
          await service.feed(targetFeed).unfollow(originFeed);
          report.userUnfollowEvent += 1;
        }
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            eventUid,
            userUid,
          },
        }, 'Feed user cannot unfollow feed event'));
      }
      break;
    }
    default: {
      // unfollow
      try {
        log.debug(`Feed ${targetFeed.entityType} ${targetFeed.entityUid} unfollow feed ${originFeed.entityType} ${originFeed.entityUid}`);
        await service.feed(targetFeed).unfollow(originFeed);
        report.userUnfollow += 1;
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            targetType: targetFeed.entityType,
            targetUid: targetFeed.entityUid,
            originType: originFeed.entityType,
            originUid: originFeed.entityUid,
          },
        }, 'Feed cannot be unfollowed'));
      }
    }
  }
}

async function checkAgendaFollow(config, report, originFeed, targetFeed) {
  const { service, knex, schemas } = config;

  switch (originFeed.entityType) {
    case 'event': {
      // unfollow if agendaEvent does not exists
      const agendaUid = targetFeed.entityUid;
      const eventUid = originFeed.entityUid;

      try {
        const agendaEvent = await knex(schemas.agendaEventService).first().where({
          agenda_uid: agendaUid,
          event_uid: eventUid,
        });
        if (!agendaEvent) {
          log.debug(`Feed agenda ${agendaUid} unfollow feed event ${eventUid}`);
          await service.feed(targetFeed).unfollow(originFeed);
          report.agendaUnfollowEvent += 1;
        }
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            eventUid,
            agendaUid,
          },
        }, 'Feed agenda cannot unfollow feed event'));
      }
      break;
    }
    case 'location': {
      // unfollow if agenda has a setUid
      const agendaUid = targetFeed.entityUid;
      const locationUid = originFeed.entityUid;

      try {
        const agenda = await knex(schemas.agenda).first().where('uid', agendaUid);
        const location = await knex(schemas.location).first().where('uid', locationUid);

        if (!agenda || agenda.location_set_uid || location.agenda_id !== agenda.id || location.deleted) {
          log.debug(`Feed agenda ${agendaUid} unfollow feed location ${locationUid}`);
          await service.feed(targetFeed).unfollow(originFeed);
          report.agendaUnfollowLocation += 1;
        }
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            locationUid,
            agendaUid,
          },
        }, 'Feed agenda cannot unfollow feed location'));
      }
      break;
    }
    case 'locationSet': {
      // unfollow if agenda does not have a setUid or has changed
      const agendaUid = targetFeed.entityUid;
      const locationSetUid = originFeed.entityUid;

      try {
        const agenda = await knex(schemas.agenda).first().where('uid', agendaUid);

        if (agenda?.location_set_uid !== locationSetUid) {
          log.debug(`Feed agenda ${agendaUid} unfollow feed locationSet ${locationSetUid}`);
          await service.feed(targetFeed).unfollow(originFeed);
          report.agendaUnfollowLocationSet += 1;
        }
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            locationSetUid,
            agendaUid,
          },
        }, 'Feed agenda cannot unfollow feed locationSet'));
      }
      break;
    }
    default: {
      // unfollow
      try {
        log.debug(`Feed ${targetFeed.entityType} ${targetFeed.entityUid} unfollow feed ${originFeed.entityType} ${originFeed.entityUid}`);
        await service.feed(targetFeed).unfollow(originFeed);
        report.agendaUnfollow += 1;
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            targetType: targetFeed.entityType,
            targetUid: targetFeed.entityUid,
            originType: originFeed.entityType,
            originUid: originFeed.entityUid,
          },
        }, 'Feed cannot be unfollowed'));
      }
    }
  }
}

async function checkEventFollow(config, report, originFeed, targetFeed) {
  const { service } = config;

  // unfollow
  try {
    log.debug(`Feed ${targetFeed.entityType} ${targetFeed.entityUid} unfollow feed ${originFeed.entityType} ${originFeed.entityUid}`);
    await service.feed(targetFeed).unfollow(originFeed);
    report.eventUnfollow += 1;
  } catch (e) {
    log.error(new VError({
      cause: e,
      info: {
        targetType: targetFeed.entityType,
        targetUid: targetFeed.entityUid,
        originType: originFeed.entityType,
        originUid: originFeed.entityUid,
      },
    }, 'Feed cannot be unfollowed'));
  }
}

async function checkLocationFollow(config, report, originFeed, targetFeed) {
  const { service } = config;

  // unfollow
  try {
    log.debug(`Feed ${targetFeed.entityType} ${targetFeed.entityUid} unfollow feed ${originFeed.entityType} ${originFeed.entityUid}`);
    await service.feed(targetFeed).unfollow(originFeed);
    report.locationUnfollow += 1;
  } catch (e) {
    log.error(new VError({
      cause: e,
      info: {
        targetType: targetFeed.entityType,
        targetUid: targetFeed.entityUid,
        originType: originFeed.entityType,
        originUid: originFeed.entityUid,
      },
    }, 'Feed cannot be unfollowed'));
  }
}

async function checkLocationSetFollow(config, report, originFeed, targetFeed) {
  const { service, knex, schemas } = config;

  if (originFeed.entityType === 'location') {
    // follow location with good setUid
    const locationSetUid = targetFeed.entityUid;
    const locationUid = originFeed.entityUid;

    try {
      const location = await knex(schemas.location).first().where('uid', locationUid);

      if (location?.set_uid !== locationSetUid || location.deleted) {
        log.debug(`Feed locationSet ${locationSetUid} unfollow feed location ${locationUid}`);
        await service.feed(targetFeed).unfollow(originFeed);
        report.locationSetUnfollowLocation += 1;
      }
    } catch (e) {
      log.error(new VError({
        cause: e,
        info: {
          locationSetUid,
          locationUid,
        },
      }, 'Feed locationSet cannot unfollow feed location'));
    }
  } else {
    // unfollow
    try {
      log.debug(`Feed ${targetFeed.entityType} ${targetFeed.entityUid} unfollow feed ${originFeed.entityType} ${originFeed.entityUid}`);
      await service.feed(targetFeed).unfollow(originFeed);
      report.locationSetUnfollow += 1;
    } catch (e) {
      log.error(new VError({
        cause: e,
        info: {
          targetType: targetFeed.entityType,
          targetUid: targetFeed.entityUid,
          originType: originFeed.entityType,
          originUid: originFeed.entityUid,
        },
      }, 'Feed cannot be unfollowed'));
    }
  }
}

// options: { agendaUid, setUid, since }
module.exports = async function rebuild(config, options = {}) {
  const { service, knex, schemas, logger } = config;

  if (logger) {
    log.setConfig(logger);
  }

  const report = {
    userFeedsCreated: 0,
    userFeedsRemoved: 0,
    userFollowAgenda: 0,
    userFollowEvent: 0,
    userUnfollowEvent: 0,
    userUnfollowAgenda: 0,
    userRefollowAgenda: 0, // bad role
    userUnfollow: 0, // follow chelou...
    agendaFeedsCreated: 0,
    agendaFeedsRemoved: 0,
    agendaFollowEvent: 0,
    agendaFollowLocation: 0,
    agendaFollowLocationSet: 0,
    agendaUnfollowEvent: 0,
    agendaUnfollowLocation: 0,
    agendaUnfollowLocationSet: 0,
    agendaUnfollow: 0, // follow chelou...
    eventFeedsCreated: 0,
    eventFeedsRemoved: 0,
    eventUnfollow: 0, // follow chelou...
    locationFeedsCreated: 0,
    locationFeedsRemoved: 0,
    locationUnfollow: 0, // follow chelou...
    locationSetFeedsCreated: 0,
    locationSetFeedsRemoved: 0,
    locationSetFollowLocation: 0,
    locationSetUnfollowLocation: 0,
    locationSetUnfollow: 0, // follow chelou...
  };


  if (!options.agendaUid && !options.setUid) {
    // Remove feeds from entities that no longer exist
    const feedsStream = knex(schemas.feed).stream();
    let feedCount = 0;

    for await (const feed of feedsStream) {
      feedCount += 1

      if (feedCount % 1000 === 0) {
        log.debug(`feed n°${feedCount}`);
      }

      switch (feed.entity_type) {
        case 'user': {
          const user = await knex(schemas.user).first().where('uid', feed.entity_uid);
          if (!user || user.is_removed) {
            const isRemoved = await removeFeed(service, feed);
            if (isRemoved) {
              report.userFeedsRemoved += 1;
            }
          }
          break;
        }
        case 'agenda': {
          const agenda = await knex(schemas.agenda).first().where('uid', feed.entity_uid);
          if (!agenda) {
            const isRemoved = await removeFeed(service, feed);
            if (isRemoved) {
              report.agendaFeedsRemoved += 1;
            }
          }
          break;
        }
        case 'event': {
          const event = await knex(schemas.eventService).first().where('uid', feed.entity_uid);
          if (!event || event.deleted_at) {
            const isRemoved = await removeFeed(service, feed);
            if (isRemoved) {
              report.eventFeedsRemoved += 1;
            }
          }
          break;
        }
        case 'location': {
          const location = await knex(schemas.location).first().where('uid', feed.entity_uid);
          if (!location) {
            const isRemoved = await removeFeed(service, feed);
            if (isRemoved) {
              report.locationFeedsRemoved += 1;
            }
          }
          break;
        }
        case 'locationSet': {
          const location = await knex(schemas.locationSet).first().where('uid', feed.entity_uid);
          if (!location) {
            const isRemoved = await removeFeed(service, feed);
            if (isRemoved) {
              report.locationSetFeedsRemoved += 1;
            }
          }
          break;
        }
      }
    }

    // Remove obsolete feed follows
    const feedFollowsStream = knex(schemas.feed_follow).stream();
    let feedFollowCount = 0;

    for await (const feedFollow of feedFollowsStream) {
      feedFollowCount += 1;

      if (feedFollowCount % 1000 === 0) {
        log.debug(`feedFollow n°${feedFollowCount}`);
      }

      let originFeed;
      let targetFeed;

      try {
        [originFeed, targetFeed] = await Promise.all([
          service.feed({ id: feedFollow.origin_feed }).get(),
          service.feed({ id: feedFollow.target_feed }).get(),
        ]);
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            id: feedFollow.id,
          },
        }, 'Cannot get feeds of follow'));
        continue;
      }

      switch (targetFeed.entityType) {
        case 'user': {
          await checkUserFollow(config, report, originFeed, targetFeed, feedFollow);
          break;
        }
        case 'agenda': {
          await checkAgendaFollow(config, report, originFeed, targetFeed, feedFollow);
          break;
        }
        case 'event': {
          await checkEventFollow(config, report, originFeed, targetFeed, feedFollow);
          break;
        }
        case 'location': {
          await checkLocationFollow(config, report, originFeed, targetFeed, feedFollow);
          break;
        }
        case 'locationSet': {
          await checkLocationSetFollow(config, report, originFeed, targetFeed, feedFollow);
          break;
        }
      }
    }
  }

  // Users + location sets
  if (!options.agendaUid) {
    // Users
    const usersStream = getUsersStream(config, options);
    let userCount = 0;

    for await (const user of usersStream) {
      userCount += 1;

      if (userCount % 1000 === 0) {
        log.debug('user', userCount);
      }

      if (user.is_removed) {
        continue;
      }

      try {
        await service.feed({ entityType: 'user', entityUid: user.uid }).create();
        report.userFeedsCreated += 1;
      } catch (e) {
        if (e.message !== 'Feed already exists') {
          log.error(new VError({
            cause: e,
            info: {
              userUid: user.uid,
            },
          }, 'Cannot create feed user'));
        }
      }
    }

    // Location sets
    const locationSetsStream = getLocationSetsStream(config, options);
    let locationSetCount = 0;

    for await (const locationSet of locationSetsStream) {
      locationSetCount += 1;

      if (locationSetCount % 1000 === 0) {
        log.debug('locationSet', locationSetCount);
      }

      try {
        await service.feed({ entityType: 'locationSet', entityUid: locationSet.uid }).create();
        report.locationSetFeedsCreated += 1;
      } catch (e) {
        if (e.message !== 'Feed already exists') {
          log.error(new VError({
            cause: e,
            info: {
              locationSetUid: locationSet.uid,
            },
          }, 'Cannot create feed locationSet'));
        }
      }
    }
  }

  // Events
  const eventsStream = getEventsStream(config, options);
  let eventCount = 0;

  for await (const event of eventsStream) {
    eventCount += 1;

    if (eventCount % 1000 === 0) {
      log.debug('event', eventCount);
    }

    if (event.deleted_at) {
      continue;
    }

    let eventFeed;

    try {
      eventFeed = await service.feed({ entityType: 'event', entityUid: event.uid }).create({ internal: true });
      report.eventFeedsCreated += 1;
    } catch (e) {
      if (e.message !== 'Feed already exists') {
        log.error(new VError({
          cause: e,
          info: {
            eventUid: event.uid,
          },
        }, 'Cannot create feed event'));
        continue;
      }
    }

    if (!eventFeed) {
      try {
        eventFeed = await service.feed({
          entityType: 'event',
          entityUid: event.uid,
        }).get({ internal: true });
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            eventUid: event.uid,
          },
        }, 'Cannot get feed event'));
        continue;
      }
    }

    try {
      if (event.userRemoved) continue;

      // log.debug(`feed user ${event.owner_uid} follow feed event ${event.uid}`);

      await service.feed({
        entityType: 'user',
        entityUid: event.owner_uid,
      }).follow(eventFeed.id);
      report.userFollowEvent += 1;
    } catch (e) {
      if (e.message !== 'Feed already followed') {
        log.error(new VError({
          cause: e,
          info: {
            userUid: event.owner_uid,
            eventUid: event.uid,
          },
        }, 'Feed user cannot follow feed event'));
      }
    }
  }

  // Agendas
  const agendasStream = getAgendasStream(config, options);
  let agendaCount = 0;
  let locationCount = 0;
  let agendaEventCount = 0;
  let memberCount = 0;

  for await (const agenda of agendasStream) {
    agendaCount += 1;

    if (agendaCount % 1000 === 0) {
      log.debug('agenda', agendaCount);
    }

    let agendaFeed;

    try {
      agendaFeed = await service.feed({ entityType: 'agenda', entityUid: agenda.uid })
        .create({ internal: true, followed: true });
      report.agendaFeedsCreated += 1;
    } catch (e) {
      if (e.message !== 'Feed already exists') {
        log.error(new VError({
          cause: e,
          info: {
            agendaUid: agenda.uid,
          },
        }, 'Cannot create feed agenda'));
        continue;
      }
    }

    if (!agendaFeed) {
      try {
        agendaFeed = await service.feed({
          entityType: 'agenda',
          entityUid: agenda.uid,
        }).get({ internal: true, followed: true });
      } catch (e) {
        log.error(new VError({
          cause: e,
          info: {
            agendaUid: agenda.uid,
          },
        }, 'Cannot get feed agenda'));
        continue;
      }
    }

    if (agenda.location_set_uid) {
      // locationSet feed created before without `options.agendaUid`
      if (options.agendaUid) {
        try {
          await service.feed({ entityType: 'locationSet', entityUid: agenda.location_set_uid }).create();
          report.locationSetFeedsCreated += 1;
        } catch (e) {
          if (e.message !== 'Feed already exists') {
            log.error(new VError({
              cause: e,
              info: {
                locationSetUid: agenda.location_set_uid,
              },
            }, 'Cannot create feed locationSet'));
          }
        }
      }

      try {
        // log.debug(`feed agenda ${agenda.uid} follow feed locationSet ${agenda.location_set_uid}`);

        await service.feed({
          entityType: 'agenda',
          entityUid: agenda.uid,
        }).follow({
          entityType: 'locationSet',
          entityUid: agenda.location_set_uid,
        });
        report.agendaFollowLocationSet += 1;
      } catch (e) {
        if (e.message !== 'Feed already followed') {
          log.error(new VError({
            cause: e,
            info: {
              agendaUid: agenda.uid,
              locationSetUid: agenda.location_set_uid,
            },
          }, 'Feed agenda cannot follow feed locationSet'));
        }
      }
    } else { // agenda don't have locationSetUid
      for (const follower of (agendaFeed.followed || [])) {
        let feed;

        try {
          feed = await service.feed({ id: follower.originFeed }).get();
        } catch (e) {
          log.error(new VError({
            cause: e,
            info: {
              feedId: follower.originFeed,
            },
          }, 'Cannot get feed'));
          continue;
        }

        if (feed.entityType === 'locationSet') {
          try {
            const unfollowed = await service.feed(agendaFeed).unfollow(feed);
            report.agendaUnfollowLocationSet += unfollowed;
          } catch (e) {
            log.error(new VError({
              cause: e,
              info: {
                agendaUid: agenda.uid,
                setUid: feed.entityUid,
              },
            }, 'Feed agenda cannot unfollow feed locationSet'));
          }
        }
      }
    }

    // Locations
    const locationsStream = getLocationsStream(config, options, agenda);

    for await (const location of locationsStream) {
      locationCount += 1;

      if (locationCount % 1000 === 0) {
        log.debug('location', locationCount);
      }

      if (location.deleted) {
        continue;
      }

      let locationFeed;

      try {
        locationFeed = await service.feed({ entityType: 'location', entityUid: location.uid })
          .create({ internal: true });
        report.locationFeedsCreated += 1;
      } catch (e) {
        if (e.message !== 'Feed already exists') {
          log.error(new VError({
            cause: e,
            info: {
              locationUid: location.uid,
            },
          }, 'Cannot create feed location'));
          continue;
        }
      }

      if (!locationFeed) {
        try {
          locationFeed = await service.feed({
            entityType: 'location',
            entityUid: location.uid,
          }).get({ internal: true, followedBy: true });
        } catch (e) {
          log.error(new VError({
            cause: e,
            info: {
              locationUid: location.uid,
            },
          }, 'Cannot get feed location'));
          continue;
        }
      }

      if (agenda.location_set_uid) {
        try {
          const unfollowed = await service.feed({
            entityType: 'agenda',
            entityUid: agenda.uid,
          }).unfollow(locationFeed);
          report.agendaUnfollowLocation += unfollowed;
        } catch (e) {
          log.error(new VError({
            cause: e,
            info: {
              agendaUid: agenda.uid,
              locationUid: location.uid,
            },
          }, 'Feed agenda cannot unfollow feed location'));
        }

        try {
          await service.feed({
            entityType: 'locationSet',
            entityUid: agenda.location_set_uid,
          }).follow(locationFeed);
          report.locationSetFollowLocation += 1;
        } catch (e) {
          if (e.message !== 'Feed already followed') {
            log.error(new VError({
              cause: e,
              info: {
                setUid: agenda.location_set_uid,
                locationUid: location.uid,
              },
            }, 'Feed locationSet cannot follow feed location'));
          }
        }
      } else {
        for (const follower of (locationFeed.followedBy || [])) {
          let feed;

          try {
            feed = await service.feed({ id: follower.targetFeed }).get();
          } catch (e) {
            log.error(new VError({
              cause: e,
              info: {
                feedId: follower.targetFeed,
              },
            }, 'Cannot get feed'));
            continue;
          }

          if (feed.entityType === 'locationSet') {
            try {
              const unfollowed = await service.feed(feed).unfollow(locationFeed);
              report.locationSetUnfollowLocation += unfollowed;
            } catch (e) {
              log.error(new VError({
                cause: e,
                info: {
                  setUid: feed.entityUid,
                  locationUid: location.uid,
                },
              }, 'Feed locationSet cannot unfollow feed location'));
            }
          }
        }

        try {
          await service.feed(agendaFeed).follow(locationFeed);
          report.agendaFollowLocation += 1;
        } catch (e) {
          if (e.message !== 'Feed already followed') {
            log.error(new VError({
              cause: e,
              info: {
                agendaUid: agenda.uid,
                locationUid: location.uid,
              },
            }, 'Feed agenda cannot follow feed location'));
          }
        }
      }
    }

    // Agenda-events
    const agendaEventsStream = getAgendaEventsStream(config, options, agenda);

    for await (const agendaEvent of agendaEventsStream) {
      agendaEventCount += 1;

      if (agendaEventCount % 1000 === 0) {
        log.debug('agendaEvent', agendaEventCount);
      }

      try {
        // log.debug(`feed agenda ${agendaEvent.agenda_uid} follow feed event ${agendaEvent.event_uid}`);

        await service.feed({
          entityType: 'agenda',
          entityUid: agendaEvent.agenda_uid,
        }).follow({
          entityType: 'event',
          entityUid: agendaEvent.event_uid,
        });
        report.agendaFollowEvent += 1;
      } catch (e) {
        if (e.message !== 'Feed already followed') {
          log.error(new VError({
            cause: e,
            info: {
              agendaUid: agendaEvent.agenda_uid,
              eventUid: agendaEvent.event_uid,
            },
          }, 'Feed agenda cannot follow feed event'));
        }
      }
    }

    // Members
    const membersStream = getMembersStream(config, options, agenda);

    for await (const member of membersStream) {
      memberCount += 1;

      if (memberCount % 1000 === 0) {
        log.debug('member', memberCount);
      }

      const feedFollow = await knex(schemas.feed_follow)
        .first()
        .leftJoin(`${schemas.feed} as targetFeed`, 'targetFeed.id', `${schemas.feed_follow}.target_feed`)
        .leftJoin(`${schemas.feed} as originFeed`, 'originFeed.id', `${schemas.feed_follow}.origin_feed`)
        .where('targetFeed.entity_type', 'user')
        .andWhere('originFeed.entity_type', 'agenda')
        .andWhere('targetFeed.entity_uid', member.user_uid)
        .andWhere('originFeed.entity_type', member.agenda_uid);

      if (feedFollow) {
        const store = JSON.parse(feedFollow.store || '{}')
        if (store.credential !== member.credential) {
          // unfollow + follow
          try {
            await service.feed({
              entityType: 'user',
              entityUid: member.user_uid,
            }).unfollow({ entityType: 'agenda', entityUid: member.agenda_uid });
          } catch (e) {
            log.error(new VError({
              cause: e,
              info: {
                agendaUid: member.agenda_uid,
                userUid: member.user_uid,
              },
            }, 'Feed user cannot unfollow feed agenda'));
            continue;
          }

          if (!member.userRemoved) {
            try {
              // log.debug(`feed user ${member.user_uid} follow feed agenda ${member.agenda_uid}`);

              await service.feed({
                entityType: 'user',
                entityUid: member.user_uid,
              }).follow({
                entityType: 'agenda',
                entityUid: member.agenda_uid,
              }, { credential: member.credential });
              report.userRefollowAgenda += 1;
            } catch (e) {
              if (e.message !== 'Feed already followed') {
                log.error(new VError({
                  cause: e,
                  info: {
                    agendaUid: member.agenda_uid,
                    userUid: member.user_uid,
                  },
                }, 'Feed user cannot follow feed agenda'));
              }
            }
          } else {
            report.userUnfollowAgenda += 1;
          }
        }
      } else {
        try {
          // log.debug(`feed user ${member.user_uid} follow feed agenda ${member.agenda_uid}`);

          await service.feed({
            entityType: 'user',
            entityUid: member.user_uid,
          }).follow({
            entityType: 'agenda',
            entityUid: member.agenda_uid,
          }, { credential: member.credential });
          report.userFollowAgenda += 1;
        } catch (e) {
          if (e.message !== 'Feed already followed') {
            log.error(new VError({
              cause: e,
              info: {
                agendaUid: member.agenda_uid,
                userUid: member.user_uid,
              },
            }, 'Feed user cannot follow feed agenda'));
          }
        }
      }
    }
  }

  log.info('Rebuild finished', report);
};
