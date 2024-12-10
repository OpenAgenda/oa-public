import wn from 'when/node.js';
import agendasSvc from '@openagenda/agendas';
import config from '../../config/index.js';
import getUsersDetails from './getUsersDetails.js';

export default async function getInboxesDetails(services, inboxesToBeDetailed) {
  const usersToBeDetailed = inboxesToBeDetailed
    .filter((v) => v.type === 'user')
    .map((v) => ({ userUid: v.identifier }));
  const agendasToBeDetailed = inboxesToBeDetailed.filter(
    (v) => v.type === 'agenda',
  );
  const supportToBeDetailed = inboxesToBeDetailed.filter(
    (v) => v.type === 'support',
  );

  const users = await getUsersDetails(services, usersToBeDetailed);
  const agendas = agendasToBeDetailed.length === 0
    ? []
    : (
      await wn.call(
        agendasSvc.list,
        { uid: agendasToBeDetailed.map((v) => v.identifier) },
        {
          private: null,
          includeImagePath: true,
          useDefaultImage: true,
        },
      )
    )[0].map((v) => ({
      uid: v.uid,
      name: v.title,
      avatar: v.image || config.s3.defaultImagePath,
    }));
  const supports = supportToBeDetailed.map((v) => ({
    ...v,
    uid: 1,
    name: 'Support - OpenAgenda',
    avatar: config.s3.oaLogoIcon,
  }));

  return [...users, ...agendas, ...supports];
}
