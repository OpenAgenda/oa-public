import _ from 'lodash';
import { NotFound } from '@openagenda/verror';
import formatMember from '../agendas/members/lib/format.js';
import validateMemberNav from '../agendas/members/lib/validateNav.js';
import validateIdentifier from './lib/validateIdentifier.js';
import validateOptions from './lib/validateOptions.js';
import assignDetailedAgendaInfo from './lib/assignDetailedAgendaInfo.js';

export default (core, identifier) =>
  async (nav = {}, options = {}) => {
    const { users, members: membersSvc } = core.services;

    const { detailed } = validateOptions(options);

    const user = await users.findOne({
      query: validateIdentifier(identifier, { pickOne: true }),
    });

    if (!user) {
      throw new NotFound(
        {
          info: { uid: identifier },
        },
        'user not found',
      );
    }

    const result = await membersSvc
      .list(
        {
          userUid: user.uid,
        },
        validateMemberNav(nav),
        {
          detailed: true,
          total: true,
        },
      )
      .then(({ members, total }) => ({
        total,
        after: _.get(_.last(members), 'order', null),
        items: members.map((item) => ({
          ..._.pick(item.agenda, ['uid', 'slug', 'title']),
          member: _.omit(formatMember(membersSvc, item, {}), 'updatedAt'),
        })),
      }));

    if (detailed) {
      await assignDetailedAgendaInfo(core, result);
    }

    return result;
  };
