import _ from 'lodash';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';

import extractEventChanges from './extractEventChanges.js';

const log = logs('events/createUpdateActivity');

export default async function createActivity(services, before, after, context) {
  log('processing');

  const { users, activities } = services;
  const { agenda, member, formSchema, agendaEvent } = context;

  if (!activities) {
    return log('warn', 'activities service is not initialized');
  }

  if (after.draft) {
    log('no activity for draft');
    return;
  }

  let user;

  if (!_.get(context, 'userUid')) {
    return log(
      'warn',
      'userUid is not set in context, will not register activity',
    );
  }

  try {
    user = await users.get(context.userUid);
  } catch (e) {
    return log('error', new VError(e, 'Error to get user %s', context.userUid));
  }

  const { hasChanges, changes, changedFields } = extractEventChanges({
    agenda,
    before,
    after,
    formSchema,
  });

  if (hasChanges) {
    await activities.addActivity(
      { entityType: 'event', entityUid: after.uid },
      {
        actor: `user:${user.uid}`,
        verb: 'event.update',
        object: `event:${after.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          labels: {
            actor: member.name ?? member.custom?.contactName ?? user.fullName,
            object: before.title,
            target: agenda.title,
          },
          diff: changes,
          contributorFields: changedFields.contributor,
          moderatorFields: changedFields.moderator,
          administratorFields: changedFields.administrator,
          userUid: agendaEvent.userUid,
        },
      },
    );
    log('changes were made, added activity');
  } else {
    log('no changes were made');
  }
}
