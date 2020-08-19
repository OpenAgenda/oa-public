import _ from 'lodash';

export default async function populateAttachments(svc, entities) {
  const { knex, schemas, aws } = svc.config;

  if (entities === null) {
    return null;
  }

  if (!Array.isArray(entities)) {
    return (await populateAttachments(svc, [entities]))?.[0];
  }

  const messageIds = _.map(entities, 'id');

  let attachments;
  let result = await knex(schemas.messageAttachment)
    .select()
    .whereIn('message_id', messageIds)
    .then(rows => rows.map(row => _.mapKeys(row, (value, key) => _.camelCase(key))));

  return entities.map(entity => {
    [attachments, result] = _.partition(result, ['messageId', entity.id]);

    entity.attachments = attachments.map(attachment => ({
      ...attachment,
      path: `https://s3.${aws.region}.amazonaws.com/${aws.bucket}/${attachment.filename}`
    }));

    return entity;
  });
}
