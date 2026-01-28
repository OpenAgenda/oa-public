import getUsersDetails from './getUsersDetails.js';

export default async function getInboxesDetails(
  config,
  services,
  inboxesToBeDetailed,
) {
  const { agendas: agendasSvc } = services;

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
      await agendasSvc
        .list(
          { uid: agendasToBeDetailed.map((v) => v.identifier) },
          {
            private: null,
            includeImagePath: true,
            useDefaultImage: true,
          },
        )
        .then((r) => r.agendas)
    ).map((v) => ({
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
