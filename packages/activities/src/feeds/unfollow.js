import logger from '@openagenda/logs';
import promisePlusCb from '@openagenda/service-utils/promisePlusCb.js';

const log = logger('activities/feeds/unfollow');

export default function unfollow(
  config,
  identifiers,
  followedFeedIdentifiers,
  cb,
) {
  const { service, knex } = config;

  const promise = service
    .feed(identifiers)
    .get({ internal: true })

    .then((feed) => {
      if (feed === null) {
        return 0;
      }

      return service
        .feed(followedFeedIdentifiers)
        .get({ internal: true })
        .then((followedFeed) => {
          if (followedFeed === null) {
            return 0;
          }

          return knex(config.schemas.feed_follow)
            .delete()
            .where({
              origin_feed: followedFeed.id,
              target_feed: feed.id,
            })
            .then((result) => {
              log('Feed n° %s unfollow feed n° %s', feed.id, followedFeed.id);

              return result;
            });
        });
    });

  return promisePlusCb(promise, cb);
}
