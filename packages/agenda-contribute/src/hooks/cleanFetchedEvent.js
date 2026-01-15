import _ from 'lodash';

export default function cleanFetchedEvent(event, options = {}) {
  const { omitState = false, schema, context } = options;

  const omitList = ['links'];

  if (omitState) {
    omitList.push('state');
  }

  (schema.fields ?? [])
    .filter((f) =>
      (f.write ? !f.write.includes(context.me.member?.role) : false))
    .forEach((f) => {
      omitList.push(f.field);
    });

  return _.omit(event, omitList);
}
