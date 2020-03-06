import _ from 'lodash';

export default async function populateLatestMessage(svc, entities, inbox) {
  const { Messages } = svc;

  if (entities === null) {
    return null;
  }

  if (!Array.isArray(entities)) {
    return (await populateLatestMessage(svc, [entities], inbox))?.[0];
  }

  // console.log( 'POPULATE LATEST MESSAGE ==>', inbox );

  const messages = await new Messages({ inbox }).list(
    { id: _.uniq(entities.map(v => v.latestMessageId)) },
    { latest: true }
  );

  return entities.map(row => {
    const id = row.latestMessageId;
    delete row.latestMessageId;

    return {
      ...row,
      latestMessage: _.find(messages.data, { id }) || null
    };
  });
}
